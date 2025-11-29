import React, { useEffect, useState } from 'react';
import { api } from './api';
import { useNavigate, useParams } from 'react-router-dom';
import { TransactionItem, Header, BottomNav } from './components.jsx';

/* Home */
export function Home() {
  const [latest, setLatest] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { api.fetchTransactions().then(setLatest).catch(()=>setLatest([])); }, []);
  const total = latest.reduce((s,t)=> s + parseFloat(t.amount || 0) * (t.type==='expense' ? -1 : 1), 0);
  return (
    <div className="page">
      <div className="card"><h3>Saldo Sekarang</h3><div style={{fontSize:22,fontWeight:700}}>Rp {total.toLocaleString()}</div></div>
      <h4>Transaksi Terbaru</h4>
      {latest.slice(0,5).map(t=> <TransactionItem key={t.id} t={t} onClick={()=>navigate(`/transactions/${t.id}`)} />)}
    </div>
  );
}

/* Transactions list */
export function Transactions() {
  const [items,setItems] = useState([]);
  const [filter,setFilter] = useState('');
  const navigate = useNavigate();
  useEffect(()=> api.fetchTransactions(filter).then(setItems).catch(()=>setItems([])), [filter]);
  return (
    <div className="page">
      <h3>Transactions</h3>
      <div style={{marginBottom:12}}>
        <button onClick={()=>setFilter('')}>All</button>
        <button onClick={()=>setFilter('income')} style={{marginLeft:8}}>Income</button>
        <button onClick={()=>setFilter('expense')} style={{marginLeft:8}}>Expense</button>
      </div>
      {items.map(t => <TransactionItem key={t.id} t={t} onClick={()=>navigate(`/transactions/${t.id}`)} />)}
    </div>
  );
}

/* Transaction detail */
export function TransactionDetail() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  useEffect(()=> api.fetchTransaction(id).then(setT).catch(()=>setT(null)), [id]);
  if (!t) return <div className="page">Loading...</div>;
  return (
    <div className="page">
      <h3>{t.title}</h3>
      <div className="card">
        <div><strong>Amount:</strong> Rp {parseFloat(t.amount).toLocaleString()}</div>
        <div><strong>Type:</strong> {t.type}</div>
        <div><strong>Category:</strong> {t.category || '-'}</div>
        <div><strong>Account:</strong> {t.account_id || '-'}</div>
        <div><strong>Note:</strong> {t.note || '-'}</div>
        <div style={{fontSize:12,color:'#666',marginTop:8}}>{new Date(t.created_at).toLocaleString()}</div>
      </div>
    </div>
  );
}

/* Accounts */
export function Accounts() {
  const [items,setItems] = useState([]);
  const navigate = useNavigate();
  useEffect(()=> api.fetchAccounts().then(setItems).catch(()=>setItems([])), []);
  return (
    <div className="page">
      <h3>Accounts</h3>
      {items.map(a => (
        <div key={a.id} className="list-item" onClick={()=>navigate(`/accounts/${a.id}`)}>
          <div>
            <div style={{fontWeight:600}}>{a.name}</div>
            <div style={{fontSize:12,color:'#666'}}>Created: {new Date(a.created_at).toLocaleDateString()}</div>
          </div>
          <div>Rp {parseFloat(a.balance || 0).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

/* Account detail */
export function AccountDetail() {
  const { id } = useParams();
  const [a,setA] = useState(null);
  useEffect(()=> api.fetchAccount(id).then(setA).catch(()=>setA(null)), [id]);
  if (!a) return <div className="page">Loading...</div>;
  return (
    <div className="page">
      <h3>{a.name}</h3>
      <div className="card">
        <div><strong>Balance:</strong> Rp {parseFloat(a.balance || 0).toLocaleString()}</div>
        <div style={{fontSize:12,color:'#666',marginTop:8}}>Created: {new Date(a.created_at).toLocaleString()}</div>
      </div>
    </div>
  );
}

/* Add new transaction */
export function AddTransaction() {
  const [form, setForm] = useState({ title:'', amount:'', type:'expense', category:'', note:'', account_id: '' });
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    try {
      await api.createTransaction(form);
      navigate('/transactions');
    } catch (err) { alert('Gagal menambah: ' + (err.message || JSON.stringify(err))); }
  }
  return (
    <div className="page">
      <h3>Add Transaction</h3>
      <form onSubmit={submit}>
        <div style={{marginBottom:8}}><input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
        <div style={{marginBottom:8}}><input placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
        <div style={{marginBottom:8}}>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div style={{marginBottom:8}}><input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></div>
        <div style={{marginBottom:8}}><input placeholder="Note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} /></div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

/* Profile */
export function Profile() {
  const [p, setP] = useState(null);
  useEffect(()=> api.fetchProfile().then(setP).catch(()=>setP(null)), []);
  if (!p) return <div className="page">Loading...</div>;
  return (
    <div className="page">
      <h3>{p.appName}</h3>
      <div className="card">
        <div><strong>Version:</strong> {p.version}</div>
        <div style={{marginTop:8}}>{p.description}</div>
        <div style={{marginTop:8}}><em>Author: {p.author}</em></div>
      </div>
    </div>
  );
}

export default null;