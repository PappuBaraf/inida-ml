import React, { useState, useRef } from 'react';
import { FlowRecord, AnalysisSummary, SeverityLevel, PageSection } from '../types';
import { parseFlowCsv, summarizeFlows } from '../utils/flowParser';
import { 
  UploadCloud, FileText, CheckCircle, AlertTriangle, Download, 
  Search, Filter, Bot, Info, RefreshCw, ChevronRight, X
} from 'lucide-react';

interface TrafficAnalyzerProps {
  currentFlows: FlowRecord[];
  onFlowsUpdated: (flows: FlowRecord[], filename: string) => void;
  onSendToAnalyst: (flow: FlowRecord) => void;
  onNavigate: (section: PageSection) => void;
}

export const TrafficAnalyzer: React.FC<TrafficAnalyzerProps> = ({
  currentFlows,
  onFlowsUpdated,
  onSendToAnalyst,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedFlow, setSelectedFlow] = useState<FlowRecord | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('cic_ids_sample_mixed_traffic.csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary = summarizeFlows(currentFlows);

  // Filtered list
  const filteredFlows = currentFlows.filter(flow => {
    const matchesSearch = 
      flow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flow.predictedLabel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.destinationPort.toString().includes(searchTerm);
    
    const matchesSeverity = filterSeverity === 'ALL' || flow.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  // Handle local file upload (CSV or text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    const fileName = file.name;

    if (fileName.endsWith('.parquet')) {
      // Parquet files are binary; explain in academic context
      setValidationError(
        `Parquet file '${fileName}' detected. Standard browser uploads require CSV conversion or server-side PyArrow extraction. Please select a CSV flow table or use the pre-converted CIC-IDS2017 demo flows.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { records, validation } = parseFlowCsv(text);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Failed to parse file schema.');
      } else {
        setActiveFileName(fileName);
        onFlowsUpdated(records, fileName);
      }
    };
    reader.onerror = () => {
      setValidationError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  // Preloaded Demo Handlers
  const loadPreloadedSample = async (type: 'mixed' | 'benign' | 'malformed') => {
    setValidationError(null);
    let path = '';
    let fname = '';

    if (type === 'mixed') {
      path = '/demo_data/cic_ids_sample_mixed_traffic.csv';
      fname = 'cic_ids_sample_mixed_traffic.csv';
    } else if (type === 'benign') {
      path = '/demo_data/cic_ids_sample_benign_flows.csv';
      fname = 'cic_ids_sample_benign_flows.csv';
    } else {
      path = '/demo_data/cic_ids_malformed_test.csv';
      fname = 'cic_ids_malformed_test.csv';
    }

    try {
      const res = await fetch(path);
      const text = await res.text();
      const { records, validation } = parseFlowCsv(text);

      if (!validation.isValid) {
        setValidationError(validation.error || 'Validation error');
      } else {
        setActiveFileName(fname);
        onFlowsUpdated(records, fname);
      }
    } catch (err: any) {
      setValidationError(`Error loading fixture: ${err.message}`);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (currentFlows.length === 0) return;
    const headers = [
      'Flow_ID', 'Destination_Port', 'Flow_Duration', 'Total_Fwd_Packets', 'Total_Bwd_Packets',
      'Flow_Bytes_s', 'Flow_Packets_s', 'SYN_Flags', 'FIN_Flags', 'ACK_Flags',
      'Predicted_Label', 'Anomaly_Score', 'Severity'
    ];
    const rows = currentFlows.map(f => [
      f.id,
      f.destinationPort,
      f.flowDuration,
      f.totalFwdPackets,
      f.totalBwdPackets,
      f.flowBytesPerSec,
      f.flowPacketsPerSec,
      f.synFlagCount,
      f.finFlagCount,
      f.ackFlagCount,
      `"${f.predictedLabel}"`,
      f.anomalyScore,
      f.severity
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INIDA_Analysis_${activeFileName.replace(/\.[^/.]+$/, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJson = () => {
    if (currentFlows.length === 0) return;
    const jsonStr = JSON.stringify({
      project: 'INIDA-ML',
      source_file: activeFileName,
      analyzed_at: new Date().toISOString(),
      summary,
      flows: currentFlows
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `INIDA_Analysis_${activeFileName.replace(/\.[^/.]+$/, '')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Upload Section */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Traffic Flow Ingestion & Inspection
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Input tabular network flow records extracted with CICFlowMeter conforming to the 77-feature CIC-IDS2017 schema.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={currentFlows.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              disabled={currentFlows.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Upload & Fixture Loader Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* File input dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/60"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv,.parquet,.txt" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <UploadCloud className="w-8 h-8 text-cyan-400 mb-2" />
            <span className="text-xs font-semibold text-white">Upload CSV or Parquet Flow Table</span>
            <span className="text-[11px] text-slate-400 mt-1">
              Supports CIC-IDS2017 format (Destination Port, Flow Duration, SYN/FIN flags)
            </span>
          </div>

          {/* Quick Preloaded Buttons */}
          <div className="border border-slate-800 rounded-lg bg-slate-950/40 p-4 space-y-2.5 flex flex-col justify-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Preloaded Academic Verification Datasets
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadPreloadedSample('mixed')}
                className="px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/80 rounded transition-colors cursor-pointer"
              >
                Mixed Traffic (DoS, PortScan, Benign)
              </button>
              <button
                onClick={() => loadPreloadedSample('benign')}
                className="px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/80 rounded transition-colors cursor-pointer"
              >
                100% Benign Baseline
              </button>
              <button
                onClick={() => loadPreloadedSample('malformed')}
                className="px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 rounded transition-colors cursor-pointer"
              >
                Test Malformed Schema Rejection
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Active File: <code className="text-slate-300 font-mono">{activeFileName}</code>
            </span>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3.5 rounded-md bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-rose-300">Schema Validation Error:</span>
              <p className="mt-0.5 leading-normal">{validationError}</p>
            </div>
            <button 
              onClick={() => setValidationError(null)}
              className="text-rose-400 hover:text-rose-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-4">
          <div className="text-xs text-slate-400">Total Analyzed Flows</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">{summary.totalFlows}</div>
        </div>
        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-4">
          <div className="text-xs text-emerald-400">Normal / Benign Flows</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1">{summary.benignCount}</div>
        </div>
        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-4">
          <div className="text-xs text-amber-400">Flagged Anomalies</div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-1">{summary.suspiciousCount}</div>
        </div>
        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-4">
          <div className="text-xs text-rose-400">Critical Threats</div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums mt-1">{summary.criticalCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Flow ID, Port, or Attack Classification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Segmented Filter (Anti-slop compliant functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
          {(['ALL', 'LOW', 'HIGH', 'CRITICAL'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev === 'ALL' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flow Table */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-medium border-b border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4">Flow ID</th>
                <th className="py-3 px-4">Dst Port</th>
                <th className="py-3 px-4">Duration (μs)</th>
                <th className="py-3 px-4">Fwd/Bwd Packets</th>
                <th className="py-3 px-4">Throughput (B/s)</th>
                <th className="py-3 px-4">SYN / ACK</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Anomaly Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No flows match current search criteria or empty dataset.
                  </td>
                </tr>
              ) : (
                filteredFlows.map(flow => {
                  const isBenign = flow.predictedLabel === 'BENIGN';
                  return (
                    <tr 
                      key={flow.id} 
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedFlow(flow)}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-300">{flow.id}</td>
                      <td className="py-2.5 px-4 text-cyan-300 tabular-nums">{flow.destinationPort}</td>
                      <td className="py-2.5 px-4 tabular-nums text-slate-300">{flow.flowDuration.toLocaleString()}</td>
                      <td className="py-2.5 px-4 tabular-nums text-slate-400">{flow.totalFwdPackets} / {flow.totalBwdPackets}</td>
                      <td className="py-2.5 px-4 tabular-nums text-slate-400">{flow.flowBytesPerSec.toLocaleString()}</td>
                      <td className="py-2.5 px-4 tabular-nums text-slate-400">{flow.synFlagCount} / {flow.ackFlagCount}</td>
                      <td className="py-2.5 px-4 font-sans">
                        <span className={`inline-block font-semibold ${
                          isBenign 
                            ? 'text-emerald-400' 
                            : flow.severity === 'CRITICAL' 
                              ? 'text-rose-400' 
                              : 'text-amber-400'
                        }`}>
                          {flow.predictedLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 tabular-nums">
                        <span className={flow.anomalyScore && flow.anomalyScore > 0.5 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {flow.anomalyScore?.toFixed(3) || '0.000'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-sans space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendToAnalyst(flow);
                            onNavigate('analyst');
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Ask AI</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Flow Inspector Modal / Drawer */}
      {selectedFlow && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border border-slate-700 bg-slate-900 rounded-lg max-w-2xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400">FLOW TELEMETRY INSPECTOR</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Flow Record: {selectedFlow.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedFlow(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Destination Port</span>
                <span className="text-cyan-300 font-bold text-sm">{selectedFlow.destinationPort}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Duration (μs)</span>
                <span className="text-white text-sm">{selectedFlow.flowDuration.toLocaleString()}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Anomaly Score</span>
                <span className="text-rose-400 font-bold text-sm">{selectedFlow.anomalyScore?.toFixed(3)}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Total Packets (Fwd/Bwd)</span>
                <span className="text-slate-300 text-sm">{selectedFlow.totalFwdPackets} / {selectedFlow.totalBwdPackets}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">SYN / FIN / ACK</span>
                <span className="text-slate-300 text-sm">{selectedFlow.synFlagCount} / {selectedFlow.finFlagCount} / {selectedFlow.ackFlagCount}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Throughput (Bytes/s)</span>
                <span className="text-slate-300 text-sm">{selectedFlow.flowBytesPerSec.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">Identified Heuristic Indicators:</span>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                {selectedFlow.indicators?.map((ind, i) => (
                  <li key={i}>{ind}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedFlow(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSendToAnalyst(selectedFlow);
                  setSelectedFlow(null);
                  onNavigate('analyst');
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Consult AI Security Analyst</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
