import React from 'react';
import { PageSection } from '../types';
import { Shield, AlertTriangle, Cpu, Activity, Database, Bot, ArrowRight, CheckCircle, Globe, Layers, Radio, ShieldCheck } from 'lucide-react';

interface OverviewDashboardProps {
  onNavigate: (section: PageSection) => void;
  onLoadDemo: () => void;
  onOpenTestModal: () => void;
  engineStatus: { configured: boolean; verified: boolean; model: string };
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onLoadDemo,
  onOpenTestModal,
  engineStatus
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/60 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>CYBERSECURITY & INTRUSION DETECTION PLATFORM</span>
              <span aria-hidden="true">·</span>
              <span>CIC-IDS2017 BENCHMARK</span>
              <span aria-hidden="true">·</span>
              <span>REAL-TIME ANALYSIS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              INIDA-ML: Intelligent Network Intrusion Detection & Anomaly Analysis
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              A high-precision machine learning pipeline designed to inspect tabular network flow characteristics, detect volumetric floods and low-and-slow anomalies, analyze malicious website links, and probe live ports for vulnerable service exposures.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={onOpenTestModal}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-sm flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Run System Self-Test</span>
            </button>
            <button
              onClick={() => onNavigate('port_scanner')}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Port Detector</span>
            </button>
          </div>
        </div>

        {/* Model Readiness Notice */}
        <div className="mt-6 p-4 rounded-md bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200/90 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300 block">
              Model Status: Model not trained — attack data required.
            </span>
            <p className="text-amber-200/80 leading-normal">
              The project dataset <code className="bg-amber-900/50 px-1 py-0.5 rounded font-mono">Benign-Monday-no-metadata.parquet</code> contains 458,831 records, all labeled <span className="font-mono font-semibold">BENIGN</span>. A supervised binary classifier cannot be trained on single-class data without causing decision boundary collapse. A statistical heuristic inspector and feature validator are active for UI testing and analysis. To train the full Random Forest classifier, multi-day attack captures (Tuesday through Friday) must be provided.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Feature Dimension</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">77</div>
          <div className="text-xs text-slate-400 mt-1">CIC-IDS2017 Flow Metrics</div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Monday Baseline Data</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">458,831</div>
          <div className="text-xs text-slate-400 mt-1">100% Benign Baseline Records</div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Live Port Prober</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">17</div>
          <div className="text-xs text-slate-400 mt-1">Key Attack Sockets Monitored</div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>AI Security Analyst</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-semibold font-mono text-cyan-300 flex items-center gap-1.5 mt-1 truncate">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span className="truncate">{engineStatus.model}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Incident Advisory Engine</div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => onNavigate('analyze')}
          className="border border-slate-800 hover:border-cyan-800/80 rounded-lg bg-slate-900/30 p-5 space-y-3 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400">FLOW ENGINE</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
            Analyze Traffic Flows
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload CSV tabular captures, validate against the CIC-IDS2017 schema, view flow anomaly scores, and export detailed reports.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('url_scanner')}
          className="border border-slate-800 hover:border-cyan-800/80 rounded-lg bg-slate-900/30 p-5 space-y-3 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400">WEB DEFENSE</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
            URL Threat Scanner
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste any website link or IP to detect phishing, credential harvesting keywords, malicious TLDs, and C2 servers.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('port_scanner')}
          className="border border-slate-800 hover:border-cyan-800/80 rounded-lg bg-slate-900/30 p-5 space-y-3 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400">RECONNAISSANCE</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
            Live Port Detector
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Probe live TCP ports and network endpoints for vulnerable service listeners (Telnet, SMB, RDP, cleartext FTP).
          </p>
        </div>

        <div 
          onClick={() => onNavigate('ml_methods')}
          className="border border-slate-800 hover:border-cyan-800/80 rounded-lg bg-slate-900/30 p-5 space-y-3 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400">ML ARCHITECTURE</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
            ML Methods & Features
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect the 77 extracted flow metrics, feature importance rankings, Random Forest specifications, and upload dataset schemas.
          </p>
        </div>
      </div>

      {/* Developer Profile Spotlight */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-500/80 bg-slate-950 ring-2 ring-cyan-500/20 shrink-0">
            <img
              src="/profile.jpg"
              alt="Pappu Baraf"
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400">DEVELOPER & RESEARCHER</div>
            <h3 className="text-sm font-bold text-white">Pappu Baraf</h3>
            <p className="text-xs text-slate-400">Computer Engineering Student | Artificial Intelligence & Machine Learning Enthusiast</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('about_me')}
          className="px-3.5 py-1.5 text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 rounded-md transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>View About Me Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
