const express = require('express');
const supabase = require('./supabase');
const router = express.Router();

/**
 * Unified API file:
 * - GET /api/transactions
 * - GET /api/transactions/:id
 * - POST /api/transactions
 * - PUT /api/transactions/:id
 * - DELETE /api/transactions/:id
 *
 * - GET /api/accounts
 * - GET /api/accounts/:id
 * - POST /api/accounts
 *
 * - GET /api/profile
 */

router.get('/transactions', async (req, res) => {
  try {
    const { type } = req.query;
    let qb = supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (type) qb = qb.eq('type', type);
    const { data, error } = await qb;
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error });
  res.json(data);
});

router.post('/transactions', async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from('transactions').insert([payload]).select().single();
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

router.put('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const { data, error } = await supabase.from('transactions').update(payload).eq('id', id).select().single();
  if (error) return res.status(400).json({ error });
  res.json(data);
});

router.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) return res.status(400).json({ error });
  res.json({ success: true });
});

/* Accounts */
router.get('/accounts', async (req, res) => {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error });
  res.json(data);
});

router.get('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error });
  res.json(data);
});

router.post('/accounts', async (req, res) => {
  const payload = req.body;
  const { data, error } = await supabase.from('accounts').insert([payload]).select().single();
  if (error) return res.status(400).json({ error });
  res.status(201).json(data);
});

/* Profile */
router.get('/profile', (req, res) => {
  res.json({
    appName: 'SaldoGo',
    version: '1.0.0',
    description: 'Aplikasi PWA sederhana untuk melacak pemasukan dan pengeluaran.',
    author: 'SaldoGo Team'
  });
});

module.exports = router;