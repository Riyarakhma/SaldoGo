import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Transactions
export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data);
export const getTransaction = (id) => api.get(`/transactions/${id}`).then(r => r.data);
export const createTransaction = (payload) => api.post('/transactions', payload).then(r => r.data);
export const updateTransaction = (id, payload) => api.put(`/transactions/${id}`, payload).then(r => r.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then(r => r.data);

// Accounts
export const getAccounts = () => api.get('/accounts').then(r => r.data);
export const getAccount = (id) => api.get(`/accounts/${id}`).then(r => r.data);
export const createAccount = (payload) => api.post('/accounts', payload).then(r => r.data);

// Categories
export const getCategories = (params) => api.get('/categories', { params }).then(r => r.data);

// Dashboard & Reports
export const getDashboard = () => api.get('/dashboard').then(r => r.data);
export const getReportByCategory = (params) => api.get('/reports/by-category', { params }).then(r => r.data);
export const getReportByMonth = (params) => api.get('/reports/by-month', { params }).then(r => r.data);

export default api;