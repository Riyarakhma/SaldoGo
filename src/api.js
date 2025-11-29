const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw err;
  }
  return res.json();
}

export const api = {
  fetchTransactions: (type) => request(`/transactions${type ? `?type=${type}` : ''}`),
  fetchTransaction: (id) => request(`/transactions/${id}`),
  createTransaction: (payload) => request('/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  fetchAccounts: () => request('/accounts'),
  fetchAccount: (id) => request(`/accounts/${id}`),
  createAccount: (payload) => request('/accounts', { method: 'POST', body: JSON.stringify(payload) }),
  fetchProfile: () => request('/profile')
};