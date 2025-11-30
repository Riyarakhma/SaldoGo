import React, { useEffect, useState } from 'react';
import { getDashboard, getTransactions } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    getDashboard().then(setSummary).catch(() => setSummary(null));
    getTransactions({ limit: 5 }).then(res => {
      if (Array.isArray(res)) setLatest(res);
      else if (res?.data) setLatest(res.data);
    }).catch(() => setLatest([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="text-sm text-gray-500">Total Balance</h3>
          <p className="text-2xl font-semibold">Rp {summary ? summary.total_balance.toLocaleString() : '—'}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-500">Total Income</h3>
          <p className="text-2xl font-semibold">Rp {summary ? summary.total_income.toLocaleString() : '—'}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-500">Total Expense</h3>
          <p className="text-2xl font-semibold">Rp {summary ? summary.total_expense.toLocaleString() : '—'}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Latest Transactions</h3>
        <div className="space-y-3">
          {latest.length === 0 && <p className="text-gray-500">No transactions</p>}
          {latest.map(tx => (
            <div key={tx.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{tx.description || '(no description)'}</div>
                <div className="text-sm text-gray-500">{tx.transaction_date ? new Date(tx.transaction_date).toLocaleString() : ''}</div>
              </div>
              <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'income' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}