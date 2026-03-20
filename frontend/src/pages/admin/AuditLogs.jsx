import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/audit-logs', { params: { take: 100 } }).then(r => setLogs(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textNavy">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Track who did what and when.</p>
      </div>

      <div className="bg-card rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Entity</th>
              <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">No logs yet.</td></tr>
            ) : logs.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors align-top">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="font-medium text-textNavy">{l.user?.name || '-'}</div>
                  <div className="text-xs text-slate-500">{l.user?.email || ''}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-textNavy whitespace-nowrap">{l.action}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{l.entity || '-'}{l.entityId ? ` #${l.entityId}` : ''}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  <pre className="whitespace-pre-wrap">{l.meta ? JSON.stringify(l.meta, null, 2) : ''}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;

