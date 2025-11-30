import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/transactions', label: 'Transactions' },
  { path: '/accounts', label: 'Accounts' },
  { path: '/categories', label: 'Categories' },
  { path: '/reports', label: 'Reports' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <nav className="bg-gray-900 text-white px-4 py-3 flex gap-6">
        <span className="font-bold text-xl tracking-wide text-teal-300">SaldoGo</span>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`hover:text-teal-300 ${
              location.pathname === item.path ? 'underline text-teal-400' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}