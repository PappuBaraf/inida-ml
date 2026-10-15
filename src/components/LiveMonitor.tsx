import React, { useState, useEffect, useRef } from 'react';
import { FlowRecord } from '../types';
import { evaluateFlowRecord } from '../utils/flowParser';
import { Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, Activity, Terminal, Info } from 'lucide-react';

interface LiveMonitorProps {
  onFlowFlagged?: (flow: FlowRecord) => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ onFlowFlagged }) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(1000);
  const [totalProcessed, setTotalProcessed] = useState<number>(142);
  const [alertCount, setAlertCount] = useState<number>(9);
  const [logs, setLogs] = useState<FlowRecord[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Stream generator
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Generate a realistic flow record
      const isAnomaly = Math.random() < 0.25; // 25% anomaly probability
      const id = `live-${Date.now().toString().slice(-6)}`;

      let mockFlow: FlowRecord;
      if (isAnomaly) {
        const attackTypes = ['slowloris', 'synflood', 'portscan', 'ssh'];
        const chosen = attackTypes[Math.floor(Math.random() * attackTypes.length)];

        if (chosen === 'slowloris') {
          mockFlow = {
            id,
            destinationPort: 80,
            flowDuration: 95000000,
            totalFwdPackets: 14,
            totalBwdPackets: 0,
            totalLengthFwdPackets: 0,
            totalLengthBwdPackets: 0,
            flowBytesPerSec: 0.0,
            flowPacketsPerSec: 0.14,
            flowIatMean: 6780000,
            synFlagCount: 14,
            ackFlagCount: 0,
            finFlagCount: 0,
            rstFlagCount: 0,
            pshFlagCount: 0,
            averagePacketSize: 0
          };
        } else if (chosen === 'synflood') {
          mockFlow = {
            id,
            destinationPort: 443,
            flowDuration: 18000,
            totalFwdPackets: 85,
            totalBwdPackets: 0,
            totalLengthFwdPackets: 0,
            totalLengthBwdPackets: 0,
            flowBytesPerSec: 0.0,
            flowPacketsPerSec: 4722.2,
            flowIatMean: 211.7,
            synFlagCount: 85,
            ackFlagCount: 0,
            finFlagCount: 0,
            rstFlagCount: 0,
            pshFlagCount: 0,
            averagePacketSize: 0
          };
        } else if (chosen === 'portscan') {
          const probePorts = [23, 135, 445, 3389, 8080];
          mockFlow = {
            id,
            destinationPort: probePorts[Math.floor(Math.random() * probePorts.length)],
            flowDuration: 1200,
            totalFwdPackets: 2,
            totalBwdPackets: 0,
            totalLengthFwdPackets: 0,
            totalLengthBwdPackets: 0,
            flowBytesPerSec: 0.0,
            flowPacketsPerSec: 1666.6,
            flowIatMean: 1200.0,
            synFlagCount: 2,
            ackFlagCount: 0,
            finFlagCount: 0,
            rstFlagCount: 0,
            pshFlagCount: 0,
            averagePacketSize: 0
          };
        } else {
          mockFlow = {
            id,
            destinationPort: 22,
            flowDuration: 380000,
            totalFwdPackets: 24,
            totalBwdPackets: 28,
            totalLengthFwdPackets: 1450,
            totalLengthBwdPackets: 2100,
            flowBytesPerSec: 9342.1,
            flowPacketsPerSec: 136.8,
            flowIatMean: 7307.6,
            synFlagCount: 2,
            ackFlagCount: 52,
            finFlagCount: 1,
            rstFlagCount: 0,
            pshFlagCount: 7,
            averagePacketSize: 68.2
          };
        }
      } else {
        // Normal benign flow
        const ports = [80, 443, 53, 8080];
        const p = ports[Math.floor(Math.random() * ports.length)];
        mockFlow = {
          id,
          destinationPort: p,
          flowDuration: Math.floor(Math.random() * 200000) + 10000,
          totalFwdPackets: Math.floor(Math.random() * 10) + 2,
          totalBwdPackets: Math.floor(Math.random() * 8) + 2,
          totalLengthFwdPackets: Math.floor(Math.random() * 800) + 200,
          totalLengthBwdPackets: Math.floor(Math.random() * 3000) + 500,
          flowBytesPerSec: Math.floor(Math.random() * 25000) + 5000,
          flowPacketsPerSec: Math.floor(Math.random() * 150) + 30,
          flowIatMean: Math.floor(Math.random() * 15000) + 2000,
          synFlagCount: 1,
          ackFlagCount: Math.floor(Math.random() * 12) + 4,
          finFlagCount: Math.random() > 0.5 ? 1 : 0,
          rstFlagCount: 0,
          pshFlagCount: Math.floor(Math.random() * 3),
          averagePacketSize: Math.floor(Math.random() * 200) + 50
        };
      }

      const evaluated = evaluateFlowRecord(mockFlow);

      setTotalProcessed(prev => prev + 1);
      if (evaluated.predictedLabel !== 'BENIGN') {
        setAlertCount(prev => prev + 1);
        if (onFlowFlagged) onFlowFlagged(evaluated);
      }

      setLogs(prev => [evaluated, ...prev.slice(0, 49)]);
    }, speedMs);

    return () => clearInterval(interval);
  }, [isRunning, speedMs, onFlowFlagged]);

  const handleReset = () => {
    setLogs([]);
    setTotalProcessed(0);
    setAlertCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>LOCAL NETWORK FLOW SIMULATOR (DEMO MODE)</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Status: {isRunning ? 'CAPTURING' : 'PAUSED'}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Honest Architectural Disclosure:</strong> Real-time raw promiscuous packet sniffing requires host OS kernel raw sockets (<code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-cyan-300">AF_PACKET / libpcap</code>) and root capabilities. Within standard sandboxed web runtimes, this live monitor operates in a high-fidelity continuous synthetic flow mode to test alerting, velocity counters, and detection pipelines without transmitting unauthorized packets across external networks.
        </p>
      </div>

      {/* Control Strip & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Flow Capture Controls</span>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Reset Counters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
          <span className="text-xs text-slate-400">Processed Flow Records</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">{totalProcessed.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Continuous sampling</span>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
          <span className="text-xs text-rose-400">Threat Alerts Triggered</span>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums mt-1">{alertCount}</div>
          <span className="text-[11px] text-slate-500">Heuristic signature hits</span>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4">
          <span className="text-xs text-slate-400">Sampling Interval</span>
          <div className="flex items-center gap-1.5 mt-2">
            {[500, 1000, 2000].map(ms => (
              <button
                key={ms}
                onClick={() => setSpeedMs(ms)}
                className={`flex-1 py-1 text-xs font-mono rounded cursor-pointer ${
                  speedMs === ms 
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Flow ingestion frequency</span>
        </div>
      </div>

      {/* Live Stream Terminal */}
      <div className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden font-mono">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Live Ingestion Flow Feed</span>
          </div>
          <span className="text-slate-500 text-[11px]">Buffer: Last 50 Events</span>
        </div>

        <div 
          ref={logContainerRef}
          className="p-4 h-96 overflow-y-auto space-y-1.5 text-xs select-text"
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-16 font-sans">
              No flows currently captured. Click Resume to start streaming.
            </div>
          ) : (
            logs.map(log => {
              const isBenign = log.predictedLabel === 'BENIGN';
              return (
                <div 
                  key={log.id} 
                  className={`p-2 rounded border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isBenign 
                      ? 'bg-slate-900/30 border-slate-800/60 text-slate-300' 
                      : log.severity === 'CRITICAL'
                        ? 'bg-rose-950/20 border-rose-800/60 text-rose-300'
                        : 'bg-amber-950/20 border-amber-800/60 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-slate-500 text-[11px] tabular-nums">{log.id}</span>
                    <span className="text-cyan-400">Port {log.destinationPort}</span>
                    <span className="text-slate-400">·</span>
                    <span className="tabular-nums text-slate-300">{log.totalFwdPackets} fwd / {log.totalBwdPackets} bwd</span>
                    <span className="text-slate-400">·</span>
                    <span className="tabular-nums text-slate-400">SYN:{log.synFlagCount} ACK:{log.ackFlagCount}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <span className={`font-semibold ${
                      isBenign ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {log.predictedLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      score: {log.anomalyScore?.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
