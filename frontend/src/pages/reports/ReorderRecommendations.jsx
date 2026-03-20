import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ReorderRecommendations = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/reports/reorder-recommendations').then((r) => setRows(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textNavy">Reorder Recommendations</h1>
        <p className="text-sm text-slate-500 mt-1">Suggested purchase quantities based on reorder levels and current stock.</p>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Reorder Lvl</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Total Stock</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Recommended</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">No recommendations right now.</td>
              </tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.sku}</td>
                <td className="px-4 py-3 font-medium text-textNavy">{r.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.category || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{r.reorderLevel}</td>
                <td className="px-4 py-3 text-slate-600">{r.totalQty}</td>
                <td className="px-4 py-3 font-bold text-accent">{r.recommendedQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReorderRecommendations;

