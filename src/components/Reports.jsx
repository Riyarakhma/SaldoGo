import React, { useEffect, useState } from 'react';
import { getReportByCategory, getReportByMonth } from '../services/api';

export default function Reports() {
  const [byCategory, setByCategory] = useState([]);
  const [byMonth, setByMonth] = useState([]);

  useEffect(() => {
    getReportByCategory().then(setByCategory).catch(() => setByCategory([]));
    getReportByMonth().then(setByMonth).catch(() => setByMonth([]));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-3">By Category</h3>
          <div className="space-y-2">
            {byCategory.map(r => (
              <div key={r.category_id} className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-xl">{r.icon}</div>
                  <div>
                    <div className="font-medium">{r.category_name}</div>
                    <div className="text-sm text-gray-500">{r.count} tx</div>
                  </div>
                </div>
                <div className="font-semibold">Rp {Number(r.total).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">By Month</h3>
          <div className="space-y-2">
            {byMonth.map(m => (
              <div key={m.month} className="flex justify-between">
                <div>{m.month}</div>
                <div className="font-semibold">Rp {Number(m.net).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}