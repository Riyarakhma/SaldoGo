import React, { useEffect, useState } from 'react';
import { getAccounts, createAccount } from '../services/api';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    getAccounts().then(setAccounts).catch(() => setAccounts([]));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name) return alert('Name required');
    try {
      await createAccount({ name, balance: 0 });
      setName('');
      const updated = await getAccounts();
      setAccounts(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Accounts</h2>
      </div>

      <form onSubmit={add} className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Account name" value={name} onChange={e => setName(e.target.value)} />
          <div></div>
          <div className="flex justify-end">
            <button className="btn btn-primary" type="submit">Create</button>
          </div>
        </div>
      </form>

      <div className="card">
        <h3 className="font-semibold mb-3">All Accounts</h3>
        <div className="space-y-3">
          {accounts.length === 0 && <p className="text-gray-500">No accounts</p>}
          {accounts.map(a => (
            <div key={a.id} className="flex items-center justify-between border-b py-2">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-gray-500">{a.type || 'wallet'}</div>
              </div>
              <div className="font-semibold">Rp {Number(a.balance).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}