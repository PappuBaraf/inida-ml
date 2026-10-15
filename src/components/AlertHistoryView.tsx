import React, { useState, useEffect } from 'react';
import { AlertHistoryItem } from '../types';
import { History, Download, Trash2, RefreshCw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AlertHistoryView: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setHistoryItems(data);
    } catch (err: any) {
      setError(`Failed to retrieve history logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Delete history item error:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems([]);
      }
    } catch (err) {
      console.error('Clear history error:', err);
    }
  };

  const handleExportHistoryJson = () => {
    const jsonStr = JSON.stringify(historyItems, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INIDA_Alert_History_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportHistoryCsv = () => {
    if (historyItems.length === 0) return;
    const headers = ['Scan_ID', 'Timestamp', 'Filename', 'Total_Flows', 'Benign_Flows', 'Suspicious_Flows', 'Critical_Flows', 'Top_Attack_Type'];
    const rows = historyItems.map(item => [
      item.id,
      item.timestamp,
      item.filename,
      item.totalFlows,
      item.benignFlows,
      item.suspiciousFlows,
      item.highSeverityFlows,
      `"${item.topAttackType}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INIDA_Alert_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <History className="w-4 h-4" />
            <span>AUDIT TRAIL & LOG PERSISTENCE</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Inspection & Alert History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Lightweight audit trail of past network flow analysis runs and flagged security incidents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportHistoryCsv}
            disabled={historyItems.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportHistoryJson}
            disabled={historyItems.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            Export JSON
          </button>
          {historyItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 rounded transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/30 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading historical scan logs...
          </div>
        ) : historyItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-sans">
            No past analysis sessions recorded. Upload or run a scan in 'Analyze Traffic' to generate history.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {historyItems.map(item => (
              <div 
                key={item.id} 
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-cyan-400 font-semibold">{item.filename}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-[11px]">{new Date(item.timestamp).toLocaleString()}</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-[11px] text-slate-500">{item.id}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-normal">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                    <span>Flows: <strong className="text-white">{item.totalFlows}</strong></span>
                    <span>Benign: <strong className="text-emerald-400">{item.benignFlows}</strong></span>
                    <span>Anomalies: <strong className="text-amber-400">{item.suspiciousFlows}</strong></span>
                    <span>Critical: <strong className="text-rose-400">{item.highSeverityFlows}</strong></span>
                    <span>Top Signature: <strong className="text-cyan-300">{item.topAttackType}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
