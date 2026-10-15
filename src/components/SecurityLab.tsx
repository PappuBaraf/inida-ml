import React, { useState } from 'react';
import { SECURITY_LAB_CASES } from '../utils/securityCases';
import { SecurityTestCase, FlowRecord, PageSection } from '../types';
import { evaluateFlowRecord } from '../utils/flowParser';
import { Shield, Play, Bot, AlertTriangle, ArrowRight, CheckCircle2, Code2 } from 'lucide-react';

interface SecurityLabProps {
  onInjectCase: (flow: FlowRecord) => void;
  onSendToAnalyst: (flow: FlowRecord) => void;
  onNavigate: (section: PageSection) => void;
}

export const SecurityLab: React.FC<SecurityLabProps> = ({
  onInjectCase,
  onSendToAnalyst,
  onNavigate
}) => {
  const [selectedCase, setSelectedCase] = useState<SecurityTestCase>(SECURITY_LAB_CASES[0]);
  const [testResult, setTestResult] = useState<FlowRecord | null>(null);

  const handleRunEvaluation = (tc: SecurityTestCase) => {
    setSelectedCase(tc);
    const mockFullRecord: FlowRecord = {
      id: `lab-${tc.id}`,
      destinationPort: tc.flowSample.destinationPort || 80,
      flowDuration: tc.flowSample.flowDuration || 1000,
      totalFwdPackets: tc.flowSample.totalFwdPackets || 1,
      totalBwdPackets: tc.flowSample.totalBwdPackets || 0,
      totalLengthFwdPackets: tc.flowSample.totalLengthFwdPackets || 0,
      totalLengthBwdPackets: tc.flowSample.totalLengthBwdPackets || 0,
      flowBytesPerSec: tc.flowSample.flowBytesPerSec || 0,
      flowPacketsPerSec: tc.flowSample.flowPacketsPerSec || 0,
      flowIatMean: tc.flowSample.flowIatMean || 0,
      synFlagCount: tc.flowSample.synFlagCount || 0,
      ackFlagCount: tc.flowSample.ackFlagCount || 0,
      finFlagCount: tc.flowSample.finFlagCount || 0,
      rstFlagCount: 0,
      pshFlagCount: 0,
      averagePacketSize: tc.flowSample.averagePacketSize || 0,
      groundTruthLabel: tc.expectedClassification
    };

    const evaluated = evaluateFlowRecord(mockFullRecord);
    setTestResult(evaluated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Shield className="w-4 h-4" />
          <span>ACADEMIC VERIFICATION & SIMULATION ENVIRONMENT</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Security Lab: Harmless Localhost Test Vectors
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Evaluate isolated attack flow profiles mapped directly to the CIC-IDS2017 benchmark dataset and MITRE ATT&CK framework. Test how the feature extractor and classifier evaluate packet distributions, inter-arrival times, and TCP control flags.
        </p>
      </div>

      {/* Main Grid: Cases List on Left, Active Case Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Vector Catalog */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Selectable Attack Signatures ({SECURITY_LAB_CASES.length})
          </span>
          <div className="space-y-2">
            {SECURITY_LAB_CASES.map(tc => {
              const isSelected = selectedCase.id === tc.id;
              return (
                <div
                  key={tc.id}
                  onClick={() => handleRunEvaluation(tc)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">{tc.category}</span>
                    <span className={`text-[11px] font-semibold ${
                      tc.severity === 'CRITICAL' ? 'text-rose-400' :
                      tc.severity === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {tc.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1">{tc.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tc.description}
                  </p>
                  <div className="mt-2.5 text-[11px] text-slate-500 font-mono truncate">
                    {tc.mitreTechnique}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Deep Dive & Evaluation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400">TEST VECTOR DETAILS</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedCase.name}</h3>
                <span className="text-xs text-cyan-400 font-mono block mt-0.5">
                  MITRE ATT&CK: {selectedCase.mitreTechnique}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunEvaluation(selectedCase)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Test</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCase.description}
            </p>

            {/* Simulated Flow Attributes */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Simulated Flow Parameters (CICFlowMeter Schema):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Target Port</span>
                  <span className="text-cyan-300 font-bold">{selectedCase.flowSample.destinationPort}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Flow Duration</span>
                  <span className="text-white">{(selectedCase.flowSample.flowDuration || 0).toLocaleString()} μs</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Fwd / Bwd Packets</span>
                  <span className="text-white">{selectedCase.flowSample.totalFwdPackets} / {selectedCase.flowSample.totalBwdPackets}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SYN Flags</span>
                  <span className="text-white">{selectedCase.flowSample.synFlagCount}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Throughput</span>
                  <span className="text-white">{selectedCase.flowSample.flowBytesPerSec?.toFixed(1)} B/s</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Flow IAT Mean</span>
                  <span className="text-white">{selectedCase.flowSample.flowIatMean?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Test Result Execution Box */}
            {testResult && (
              <div className="border border-slate-700 bg-slate-950 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">INIDA-ML Classifier Output:</span>
                  <span className="text-slate-400 font-mono">
                    Anomaly Score: <strong className="text-rose-400">{testResult.anomalyScore}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-base font-bold ${
                    testResult.predictedLabel === 'BENIGN' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {testResult.predictedLabel}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-mono">Severity: {testResult.severity}</span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <span className="font-medium text-slate-300 block">Triggered Heuristics:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {testResult.indicators?.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onInjectCase(testResult);
                      onNavigate('analyze');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 rounded transition-colors cursor-pointer"
                  >
                    Send to Traffic Analyzer Table
                  </button>
                  <button
                    onClick={() => {
                      onSendToAnalyst(testResult);
                      onNavigate('analyst');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Consult AI Threat Analyst</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
