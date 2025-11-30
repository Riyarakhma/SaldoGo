import React, { useEffect, useState } from 'react';
import { getTransactions, createTransaction } from '../services/api';

function NewTxForm({ onCreated }) {
  const [payload, setPayload] = useState({
    type: 'expense',
    amount: '',
    description: '',
    account_id: ''
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!payload.account_id) {
      alert('Set account_id first (use an existing account id).');
      return;
    }
    try {
      await createTransaction({ ...payload, amount: Number(payload.amount) });
      setPayload({ type: 'expense', amount: '', description: '', account_id: '' });
      onCreated();
    } catch (err) {
      alert(err?.response?.data?.error?.message || err.message);
    }
  };

  return (
    <form onSubmit={submit} className="card mb-4">
      <h3 className="font-semibold mb-3">New Transaction</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select className="input" value={payload.type} onChange={e => setPayload({ ...payload, type: e.target.value })}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
        <input className="input" placeholder="Amount" value={payload.amount} onChange={e => setPayload({ ...payload, amount: e.target.value })} />
        <input className="input" placeholder="Account ID" value={payload.account_id} onChange={e => setPayload({ ...payload, account_id: e.target.value })} />
      </div>
      <input className="input mt-3" placeholder="Description" value={payload.description} onChange={e => setPayload({ ...payload, description: e.target.value })} />
      <div className="mt-3 flex justify-end">
        <button type="submit" className="btn btn-primary">Add</button>
      </div>
    </form>
  );
}

export default function Transactions() {
  const [items, setItems] = useState([]);

  const load = () => {
    getTransactions().then(res => {
      if (Array.isArray(res)) setItems(res);
      else if (res?.data) setItems(res.data);
    }).catch(() => setItems([]));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Transactions</h2>
      </div>

      <NewTxForm onCreated={load} />

      <div className="card">
        <h3 className="font-semibold mb-3">All Transactions</h3>
        <div className="space-y-3">
          {items.length === 0 && <p className="text-gray-500">No transactions</p>}
          {items.map(tx => (
            <div key={tx.id} className="flex items-center justify-between border-b py-2">
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