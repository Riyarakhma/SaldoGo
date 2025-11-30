const express = require('express');
const supabase = require('./supabase');
const router = express.Router();

/**
 * ============================================
 * SALDOGO API ROUTES
 * ============================================
 * Complete REST API for finance tracking app
 */

// ============================================
// TRANSACTIONS ROUTES
// ============================================

/**
 * GET /api/transactions
 * Get all transactions with optional filtering
 * Query params: type (income/expense/transfer), limit, offset
 */
router. get('/transactions', async (req, res) => {
  try {
    const { type, limit, offset, account_id, category_id, start_date, end_date } = req.query;
    
    let qb = supabase
      .from('transactions')
      .select(`
        *,
        account:accounts(id, name, type, icon, color),
        category:categories(id, name, type, icon, color),
        to_account:to_account_id(id, name)
      `)
      .order('transaction_date', { ascending: false });
    
    // Apply filters
    if (type) qb = qb.eq('type', type);
    if (account_id) qb = qb.eq('account_id', account_id);
    if (category_id) qb = qb.eq('category_id', category_id);
    if (start_date) qb = qb.gte('transaction_date', start_date);
    if (end_date) qb = qb.lte('transaction_date', end_date);
    if (limit) qb = qb.limit(parseInt(limit));
    if (offset) qb = qb.range(parseInt(offset), parseInt(offset) + (parseInt(limit) || 10) - 1);
    
    const { data, error, count } = await qb;
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({
      data,
      count,
      limit: limit ?  parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null
    });
  } catch (err) {
    res.status(500).json({ error: err. message });
  }
});

/**
 * GET /api/transactions/:id
 * Get single transaction by ID
 */
router.get('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        account:accounts(id, name, type, icon, color),
        category:categories(id, name, type, icon, color),
        to_account:to_account_id(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (error) return res.status(404).json({ error: 'Transaction not found' });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/transactions
 * Create new transaction
 * Body: { type, amount, description, account_id, category_id, to_account_id, notes, tags, transaction_date }
 */
router.post('/transactions', async (req, res) => {
  try {
    const payload = req. body;
    
    // Validation
    if (!payload.type || !payload.amount || !payload.account_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, amount, account_id' 
      });
    }
    
    if (! ['income', 'expense', 'transfer'].includes(payload.type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be: income, expense, or transfer' 
      });
    }
    
    if (payload.type === 'transfer' && !payload.to_account_id) {
      return res. status(400).json({ 
        error: 'to_account_id is required for transfer transactions' 
      });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select(`
        *,
        account:accounts(id, name, type, icon, color),
        category:categories(id, name, type, icon, color)
      `)
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/transactions/:id
 * Update existing transaction
 */
router.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete payload.id;
    delete payload.created_at;
    
    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        account:accounts(id, name, type, icon, color),
        category:categories(id, name, type, icon, color)
      `)
      .single();
    
    if (error) return res. status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete transaction
 */
router.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      . eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ACCOUNTS ROUTES
// ============================================

/**
 * GET /api/accounts
 * Get all accounts with transaction summary
 */
router.get('/accounts', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let qb = supabase
      .from('accounts')
      . select('*')
      .order('created_at', { ascending: false });
    
    if (is_active !== undefined) {
      qb = qb.eq('is_active', is_active === 'true');
    }
    
    const { data, error } = await qb;
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/accounts/:id
 * Get single account with details
 */
router.get('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return res.status(404).json({ error: 'Account not found' });
    
    // Get transaction summary for this account
    const { data: transactions } = await supabase
      . from('transactions')
      .select('type, amount')
      .eq('account_id', id);
    
    const summary = {
      total_income: transactions
        ?.filter(t => t.type === 'income')
        . reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0,
      total_expense: transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0,
      transaction_count: transactions?.length || 0
    };
    
    res. json({ ... data, summary });
  } catch (err) {
    res. status(500).json({ error: err.message });
  }
});

/**
 * POST /api/accounts
 * Create new account
 * Body: { name, type, balance, currency, icon, color }
 */
router.post('/accounts', async (req, res) => {
  try {
    const payload = req.body;
    
    // Validation
    if (!payload.name) {
      return res.status(400).json({ error: 'Account name is required' });
    }
    
    const { data, error } = await supabase
      .from('accounts')
      .insert([payload])
      .select()
      .single();
    
    if (error) return res. status(400).json({ error: error.message });
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err. message });
  }
});

/**
 * PUT /api/accounts/:id
 * Update account
 */
router.put('/accounts/:id', async (req, res) => {
  try {
    const { id } = req. params;
    const payload = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete payload.id;
    delete payload.created_at;
    
    const { data, error } = await supabase
      .from('accounts')
      .update(payload)
      . eq('id', id)
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/accounts/:id
 * Delete account (soft delete by setting is_active = false)
 */
router. delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hard_delete } = req.query;
    
    if (hard_delete === 'true') {
      // Hard delete
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      
      if (error) return res.status(400).json({ error: error.message });
    } else {
      // Soft delete
      const { error } = await supabase
        .from('accounts')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CATEGORIES ROUTES
// ============================================

/**
 * GET /api/categories
 * Get all categories
 * Query params: type (income/expense)
 */
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    
    let qb = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (type) qb = qb.eq('type', type);
    
    const { data, error } = await qb;
    
    if (error) return res.status(500). json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err. message });
  }
});

/**
 * GET /api/categories/:id
 * Get single category
 */
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return res.status(404).json({ error: 'Category not found' });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/categories
 * Create new category
 * Body: { name, type, icon, color }
 */
router.post('/categories', async (req, res) => {
  try {
    const payload = req.body;
    
    // Validation
    if (! payload.name || !payload.type) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, type' 
      });
    }
    
    if (!['income', 'expense'].includes(payload.type)) {
      return res.status(400).json({ 
        error: 'Invalid type. Must be: income or expense' 
      });
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert([payload])
      .select()
      .single();
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/categories/:id
 * Update category
 */
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    delete payload.id;
    delete payload.created_at;
    
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return res. status(400).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete category
 */
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req. params;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500). json({ error: err.message });
  }
});

// ============================================
// BUDGETS ROUTES
// ============================================

/**
 * GET /api/budgets
 * Get all budgets
 */
router.get('/budgets', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let qb = supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, icon, color)
      `)
      .order('created_at', { ascending: false });
    
    if (is_active !== undefined) {
      qb = qb.eq('is_active', is_active === 'true');
    }
    
    const { data, error } = await qb;
    
    if (error) return res.status(500).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/budgets/:id
 * Get single budget with spending info
 */
router.get('/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: budget, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, icon, color)
      `)
      .eq('id', id)
      . single();
    
    if (error) return res.status(404).json({ error: 'Budget not found' });
    
    // Calculate spent amount
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('transaction_date', budget.start_date)
      .lte('transaction_date', budget.end_date || new Date(). toISOString());
    
    const spent = transactions?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    const remaining = parseFloat(budget.amount) - spent;
    const percentage = (spent / parseFloat(budget.amount)) * 100;
    
    res.json({
      ...budget,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/budgets
 * Create new budget
 */
router.post('/budgets', async (req, res) => {
  try {
    const payload = req.body;
    
    if (!payload.category_id || !payload.amount || !payload.start_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: category_id, amount, start_date' 
      });
    }
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([payload])
      .select(`
        *,
        category:categories(id, name, icon, color)
      `)
      .single();
    
    if (error) return res.status(400).json({ error: error. message });
    
    res. status(201).json(data);
  } catch (err) {
    res.status(500). json({ error: err.message });
  }
});

/**
 * PUT /api/budgets/:id
 * Update budget
 */
router.put('/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    
    delete payload.id;
    delete payload.created_at;
    
    const { data, error } = await supabase
      . from('budgets')
      . update(payload)
      .eq('id', id)
      . select(`
        *,
        category:categories(id, name, icon, color)
      `)
      .single();
    
    if (error) return res.status(400).json({ error: error. message });
    
    res. json(data);
  } catch (err) {
    res. status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/budgets/:id
 * Delete budget
 */
router.delete('/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ANALYTICS & REPORTS
// ============================================

/**
 * GET /api/dashboard
 * Get dashboard summary
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Get all transactions in date range
    let qb = supabase. from('transactions').select('type, amount, transaction_date');
    
    if (start_date) qb = qb.gte('transaction_date', start_date);
    if (end_date) qb = qb.lte('transaction_date', end_date);
    
    const { data: transactions } = await qb;
    
    // Calculate totals
    const total_income = transactions
      ?. filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    
    const total_expense = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    
    const net_income = total_income - total_expense;
    
    // Get total balance from all accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance')
      .eq('is_active', true);
    
    const total_balance = accounts?.reduce((sum, a) => sum + parseFloat(a.balance), 0) || 0;
    
    // Get transaction count
    const transaction_count = transactions?.length || 0;
    
    res. json({
      total_income,
      total_expense,
      net_income,
      total_balance,
      transaction_count,
      period: {
        start_date: start_date || null,
        end_date: end_date || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err. message });
  }
});

/**
 * GET /api/reports/by-category
 * Get spending report grouped by category
 */
router. get('/reports/by-category', async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;
    
    let qb = supabase
      .from('transactions')
      .select(`
        amount,
        type,
        category:categories(id, name, icon, color)
      `);
    
    if (type) qb = qb.eq('type', type);
    if (start_date) qb = qb.gte('transaction_date', start_date);
    if (end_date) qb = qb.lte('transaction_date', end_date);
    
    const { data: transactions } = await qb;
    
    // Group by category
    const grouped = {};
    transactions?. forEach(t => {
      const categoryId = t.category?. id || 'uncategorized';
      const categoryName = t.category?.name || 'Uncategorized';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          category_id: categoryId,
          category_name: categoryName,
          icon: t.category?.icon || '📁',
          color: t.category?.color || '#6B7280',
          total: 0,
          count: 0
        };
      }
      
      grouped[categoryId].total += parseFloat(t.amount);
      grouped[categoryId].count += 1;
    });
    
    const result = Object.values(grouped). sort((a, b) => b.total - a.total);
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reports/by-month
 * Get monthly spending trend
 */
router.get('/reports/by-month', async (req, res) => {
  try {
    const { type, months = 12 } = req.query;
    
    let qb = supabase
      .from('transactions')
      .select('amount, type, transaction_date');
    
    if (type) qb = qb.eq('type', type);
    
    const { data: transactions } = await qb;
    
    // Group by month
    const grouped = {};
    transactions?.forEach(t => {
      const date = new Date(t.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date. getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          net: 0
        };
      }
      
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        grouped[monthKey].income += amount;
      } else if (t.type === 'expense') {
        grouped[monthKey].expense += amount;
      }
      
      grouped[monthKey].net = grouped[monthKey].income - grouped[monthKey].expense;
    });
    
    const result = Object.values(grouped)
      .sort((a, b) => a.month. localeCompare(b.month))
      .slice(-parseInt(months));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err. message });
  }
});

// ============================================
// APP INFO
// ============================================

/**
 * GET /api/profile
 * Get app information
 */
router.get('/profile', (req, res) => {
  res.json({
    appName: 'SaldoGo',
    version: '1.0.0',
    description: 'Aplikasi PWA sederhana untuk melacak pemasukan dan pengeluaran.',
    author: 'SaldoGo Team',
    features: [
      'Multi-account management',
      'Income & expense tracking',
      'Budget monitoring',
      'Category management',
      'Financial reports',
      'Transfer between accounts'
    ],
    endpoints: {
      transactions: '/api/transactions',
      accounts: '/api/accounts',
      categories: '/api/categories',
      budgets: '/api/budgets',
      dashboard: '/api/dashboard',
      reports: '/api/reports/*'
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', (req, res) => {
  res. json({ 
    status: 'OK', 
    timestamp: new Date(). toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;