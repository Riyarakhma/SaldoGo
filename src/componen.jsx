import React from 'react';
import { NavLink } from 'react-router-dom';

export function Header({ title = 'SaldoGo' }) {
  return <div className="header">{title}</div>;
}
export default Header;

export function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="bottom nav">
      <NavLink to="/" className="nav-item">Home</NavLink>
      <NavLink to="/transactions" className="nav-item">Transactions</NavLink>
      <NavLink to="/add" className="nav-item">Add</NavLink>
      <NavLink to="/accounts" className="nav-item">Accounts</NavLink>
      <NavLink to="/profile" className="nav-item">Profile</NavLink>
    </nav>
  );
}

export function TransactionItem({ t, onClick }) {
  return (
    <div className="list-item" onClick={onClick}>
      <div>
        <div style={{fontWeight:600}}>{t.title}</div>
        <div style={{fontSize:12,color:'#666'}}>{new Date(t.created_at).toLocaleString()}</div>
      </div>
      <div style={{color: t.type==='expense' ? '#d32f2f' : '#2e7d32'}}>
        {t.type==='expense' ? '-' : '+'} Rp {parseFloat(t.amount).toLocaleString()}
      </div>
    </div>
  );
}