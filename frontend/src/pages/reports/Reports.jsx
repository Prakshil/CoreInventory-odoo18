import React, { useMemo, useState } from 'react';
import api from '../../services/api';
import { Download, Search } from 'lucide-react';

const Reports = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => query.trim().length > 1, [query]);

  const download = (path) => {
    window.open(`${api.defaults.baseURL}${path}`, '_blank', 'noopener,noreferrer');
  };

  const whereIsIt = async () => {
    if (!canSearch) return;
    setLoading(true);
    try {
      const res = await api.get('/stock/where-is-it', { params: { query } });
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textNavy">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Download read-only reports and quickly locate stock across warehouses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-textNavy">Downloads</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => download('/reports/stock-summary.csv')}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-medium text-textNavy transition-colors"
            >
              <span>Stock Summary (CSV)</span>
              <Download className="h-4 w-4 text-slate-500" />
            </button>
            <button
              onClick={() => download('/reports/low-stock.csv')}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-medium text-textNavy transition-colors"
            >
              <span>Low Stock Alert (CSV)</span>
              <Download className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-textNavy">Where is it?</h2>
          <p className="text-sm text-slate-500">Search by SKU or product name to see totals per warehouse.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50"
                placeholder="e.g. IPHONE, SKU-1001..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && whereIsIt()}
              />
            </div>
            <button
              onClick={whereIsIt}
              disabled={!canSearch || loading}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-sm text-slate-400 py-4">No results yet. Search to begin.</div>
            ) : (
              results.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-textNavy">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{p.sku}</div>
                    </div>
                    <div className="text-sm font-bold text-textNavy">{p.totalQty}</div>
                  </div>
                  <div className="p-4">
                    {p.perWarehouse.length === 0 ? (
                      <div className="text-sm text-slate-400">No stock in any warehouse.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {p.perWarehouse.map((w) => (
                          <div key={w.warehouseId} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                            <div>
                              <div className="text-sm font-semibold text-textNavy">{w.warehouseName}</div>
                              <div className="text-xs text-slate-500">{w.shortCode}</div>
                            </div>
                            <div className="text-sm font-bold text-textNavy">{w.quantity}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

