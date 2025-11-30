import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/api';

export default function Categories() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    getCategories().then(setCats).catch(() => setCats([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">All Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cats.map(c => (
            <div key={c.id} className="p-3 border rounded">
              <div className="text-lg">{c.icon} {c.name}</div>
              <div className="text-sm text-gray-500">{c.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}