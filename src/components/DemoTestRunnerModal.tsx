import React, { useState } from 'react';
import { DiagnosticReport, DiagnosticCheckItem } from '../types';
import { CheckCircle2, AlertTriangle, RefreshCw, X, Play, ShieldCheck, Terminal } from 'lucide-react';

interface DemoTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoTestRunnerModal: React.FC<DemoTestRunnerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunDiagnostics = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/test/demo-run');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Diagnostic test execution failed');
      setReport(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running test suite');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="border border-slate-700 bg-slate-900 rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Automated System Diagnostic & Demo Test</h3>
              <span className="text-[11px] font-mono text-slate-400">
                End-to-end verification of detection pipelines, ML features, and AI engine
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Run an instant self-test verifying the flow ingestion engine, URL threat analyzer, live TCP socket prober, and AI incident responder.
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleRunDiagnostics}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded transition-colors cursor-pointer shadow-sm"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Executing Automated Test Suite...' : 'Run Full Demo System Test'}</span>
          </button>

          {report && (
            <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: {report.overallStatus}</span>
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {report && (
          <div className="border border-slate-800 rounded bg-slate-950 overflow-hidden divide-y divide-slate-800/80">
            {report.checks.map((check, i) => (
              <div key={i} className="p-3 flex items-center justify-between text-xs font-mono">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">{check.name}</span>
                  <span className="text-[11px] text-slate-400 font-sans block">{check.details}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  check.status === 'PASS' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
