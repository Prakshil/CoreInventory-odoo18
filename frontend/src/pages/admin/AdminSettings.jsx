import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminSettings = () => {
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({});

  const fetchSettings = () =>
    api.get('/admin/settings')
      .then((r) => {
        setRows(r.data);
        const d = {};
        r.data.forEach((s) => { d[s.key] = s.value; });
        setDraft(d);
      })
      .catch(() => {});

  useEffect(() => { fetchSettings(); }, []);

  const save = async () => {
    const settings = Object.entries(draft).map(([key, value]) => ({ key, value }));
    await api.put('/admin/settings', { settings });
    fetchSettings();
  };

  const setField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-textNavy">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Global settings visible to Admin only.</p>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={draft.COMPANY_NAME || ''} onChange={(e) => setField('COMPANY_NAME', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={draft.TIMEZONE || ''} onChange={(e) => setField('TIMEZONE', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={draft.CURRENCY || ''} onChange={(e) => setField('CURRENCY', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SMTP From Email</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={draft.SMTP_FROM || ''} onChange={(e) => setField('SMTP_FROM', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-blue-700 shadow-sm shadow-primary/30 transition-all">
            Save Settings
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Existing keys in DB: {rows.length === 0 ? 'none' : rows.map(r => r.key).join(', ')}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

