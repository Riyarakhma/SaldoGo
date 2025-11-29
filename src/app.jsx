import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components.jsx';
import { Home, Transactions, TransactionDetail, Accounts, AccountDetail, AddTransaction, Profile } from './pages.jsx';
import BottomNav from './components.jsx';

export default function App(){
  return (
    <div className="app-shell">
      <Header title="SaldoGo" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/:id" element={<TransactionDetail />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/add" element={<AddTransaction />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
}