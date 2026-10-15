import React, { useState } from 'react';
import { PortScanResult, PortItem, PageSection } from '../types';
import { 
  Radio, Shield, AlertTriangle, CheckCircle2, ShieldAlert, 
  Terminal, Bot, Download, Play, RefreshCw, Server, ArrowRight
} from 'lucide-react';

interface LivePortDetectorProps {
  onSendToAnalyst: (context: any) => void;
  onNavigate: (section: PageSection) => void;
}

export const LivePortDetector: React.FC<LivePortDetectorProps> = ({
  onSendToAnalyst,
  onNavigate
}) => {
  const [targetHost, setTargetHost] = useState<string>('127.0.0.1');
  const [selectedProfile, setSelectedProfile] = useState<'common' | 'full' | 'custom'>('full');
  const [customPortsInput, setCustomPortsInput] = useState<string>('80, 443, 3000, 8080');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<PortScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    let portsToScan: number[];
    if (selectedProfile === 'common') {
      portsToScan = [21, 22, 23, 53, 80, 443, 445, 3306, 3389, 8080];
    } else if (selectedProfile === 'full') {
      portsToScan = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 1433, 3306, 3389, 5432, 8080];
    } else {
      portsToScan = customPortsInput
        .split(',')
        .map(p => parseInt(p.trim(), 10))
        .filter(p => !isNaN(p) && p > 0 && p <= 65535);
      if (portsToScan.length === 0) {
        portsToScan = [80, 443, 3000, 8080];
      }
    }

    try {
      const res = await fetch('/api/port/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetHost,
          targetPorts: portsToScan
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Port detection failed');
      }

      setScanResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while probing ports');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportJson = () => {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Port_Scan_${scanResult.targetHost}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>NETWORK RECONNAISSANCE & SERVICE VULNERABILITY AUDITOR</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Live Port Detection & Service Prober
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Probe network endpoints to determine open TCP listeners, discover vulnerable services (Telnet, unauthenticated SMB, database exposures), calculate handshake latencies, and generate defensive firewall rules.
        </p>

        {/* Scan Parameters Row */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Host / IP Address:</label>
            <div className="relative">
              <Server className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                placeholder="e.g. 127.0.0.1, localhost, 192.168.1.1"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Port Selection Profile:</label>
            <select
              value={selectedProfile}
              onChange={(e: any) => setSelectedProfile(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="full">All 17 Essential Attack Ports (Recommended)</option>
              <option value="common">Top 10 Web & Administrative Ports</option>
              <option value="custom">Custom Specified Ports</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full py-2 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Probing Sockets...' : 'Launch Port Scan'}</span>
            </button>
          </div>
        </div>

        {selectedProfile === 'custom' && (
          <div className="pt-1">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Comma-separated TCP ports:</label>
            <input
              type="text"
              value={customPortsInput}
              onChange={(e) => setCustomPortsInput(e.target.value)}
              placeholder="e.g. 80, 443, 3000, 8080, 27017"
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {scanResult && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
              <span className="text-xs text-slate-400">Target Audited</span>
              <div className="text-lg font-bold font-mono text-cyan-300 mt-1 truncate">{scanResult.targetHost}</div>
            </div>
            <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
              <span className="text-xs text-slate-400">Total Probed Ports</span>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{scanResult.totalPortsScanned}</div>
            </div>
            <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
              <span className="text-xs text-emerald-400">Open Ports Detected</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{scanResult.openPortsCount}</div>
            </div>
            <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
              <span className="text-xs text-rose-400">High / Critical Exposures</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">{scanResult.criticalOpenCount}</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              Scan completed at {new Date(scanResult.scannedAt).toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Port Audit JSON</span>
              </button>
              <button
                onClick={() => {
                  onSendToAnalyst({
                    type: 'PORT_SCAN_AUDIT',
                    target: scanResult.targetHost,
                    openPortsCount: scanResult.openPortsCount,
                    openPorts: scanResult.ports.filter(p => p.state === 'OPEN')
                  });
                  onNavigate('analyst');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Investigate Exposure with AI</span>
              </button>
            </div>
          </div>

          {/* Detailed Ports Table */}
          <div className="border border-slate-800 rounded-lg bg-slate-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 select-none">
                  <tr>
                    <th className="py-3 px-4">Port</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Risk Rating</th>
                    <th className="py-3 px-4">Vulnerability Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {scanResult.ports.map(p => {
                    const isOpen = p.state === 'OPEN';
                    return (
                      <tr key={p.port} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-cyan-300 tabular-nums">
                          {p.port} <span className="text-[10px] text-slate-500 font-normal">/tcp</span>
                        </td>
                        <td className="py-2.5 px-4 font-sans font-medium text-white">{p.service}</td>
                        <td className="py-2.5 px-4 font-sans">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isOpen
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                            {p.state}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 tabular-nums">{p.latencyMs} ms</td>
                        <td className="py-2.5 px-4 font-sans">
                          <span className={`text-[11px] font-semibold ${
                            p.risk === 'CRITICAL' ? 'text-rose-400' :
                            p.risk === 'HIGH' ? 'text-amber-400' :
                            p.risk === 'MEDIUM' ? 'text-yellow-400' : 'text-slate-400'
                          }`}>
                            {p.risk}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-300 text-xs leading-normal max-w-md">
                          {p.securityNotes}
                        </td>
                        <td className="py-2.5 px-4 text-right font-sans">
                          <button
                            onClick={() => {
                              onSendToAnalyst({
                                type: 'SINGLE_PORT_AUDIT',
                                port: p.port,
                                service: p.service,
                                state: p.state,
                                risk: p.risk,
                                securityNotes: p.securityNotes
                              });
                              onNavigate('analyst');
                            }}
                            className="px-2 py-1 text-[11px] text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Bot className="w-3 h-3" />
                            <span>Remediate</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
