import React, { useState, useEffect } from 'react';
import { PageSection, FlowRecord } from './types';
import { Navigation } from './components/Navigation';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TrafficAnalyzer } from './components/TrafficAnalyzer';
import { UrlThreatScanner } from './components/UrlThreatScanner';
import { LivePortDetector } from './components/LivePortDetector';
import { MlMethodsFeatures } from './components/MlMethodsFeatures';
import { LiveMonitor } from './components/LiveMonitor';
import { SecurityLab } from './components/SecurityLab';
import { AISecurityAnalyst } from './components/AISecurityAnalyst';
import { AlertHistoryView } from './components/AlertHistoryView';
import { ModelInfoHelp } from './components/ModelInfoHelp';
import { AboutMe } from './components/AboutMe';
import { DemoTestRunnerModal } from './components/DemoTestRunnerModal';
import { parseFlowCsv } from './utils/flowParser';
import { Shield } from 'lucide-react';

export default function App() {
  const [currentSection, setCurrentSection] = useState<PageSection>('overview');
  const [currentFlows, setCurrentFlows] = useState<FlowRecord[]>([]);
  const [activeContext, setActiveContext] = useState<any | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<{ configured: boolean; verified: boolean; model: string }>({
    configured: false,
    verified: false,
    model: 'Neural Threat Engine'
  });

  // Check engine status on mount
  useEffect(() => {
    fetch('/api/groq/status')
      .then(res => res.json())
      .then(data => {
        setEngineStatus({
          configured: !!data.configured,
          verified: !!data.verified,
          model: data.model || 'Neural Threat Engine'
        });
      })
      .catch(() => {
        setEngineStatus({
          configured: false,
          verified: false,
          model: 'Neural Threat Engine'
        });
      });

    // Preload mixed sample flows for zero-state readiness
    fetch('/demo_data/cic_ids_sample_mixed_traffic.csv')
      .then(res => res.text())
      .then(text => {
        const { records } = parseFlowCsv(text);
        if (records.length > 0) {
          setCurrentFlows(records);
        }
      })
      .catch(err => {
        console.error('Failed to preload initial flow fixtures:', err);
      });
  }, []);

  // Sync scan results to server history
  const handleFlowsUpdated = (flows: FlowRecord[], filename: string) => {
    setCurrentFlows(flows);
    const benign = flows.filter(f => f.predictedLabel === 'BENIGN').length;
    const suspicious = flows.length - benign;
    const high = flows.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length;

    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        totalFlows: flows.length,
        benignFlows: benign,
        suspiciousFlows: suspicious,
        highSeverityFlows: high,
        topAttackType: suspicious > 0 ? 'DoS / PortScan Patterns' : 'None (All Benign)',
        summary: `Parsed and validated ${flows.length} tabular flows from ${filename}.`
      })
    }).catch(e => console.error('History record save error:', e));
  };

  const handleSendToAnalyst = (context: any) => {
    setActiveContext(context);
    setCurrentSection('analyst');
  };

  const handleInjectCase = (flow: FlowRecord) => {
    setCurrentFlows(prev => [flow, ...prev]);
    setCurrentSection('analyze');
  };

  const handleLoadDemo = async () => {
    try {
      const res = await fetch('/demo_data/cic_ids_sample_mixed_traffic.csv');
      const text = await res.text();
      const { records } = parseFlowCsv(text);
      if (records.length > 0) {
        handleFlowsUpdated(records, 'cic_ids_sample_mixed_traffic.csv');
        setCurrentSection('analyze');
      }
    } catch (e) {
      console.error('Failed to load demo:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navigation
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onQuickAction={handleLoadDemo}
        onOpenTestModal={() => setIsTestModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentSection === 'overview' && (
          <OverviewDashboard
            onNavigate={setCurrentSection}
            onLoadDemo={handleLoadDemo}
            onOpenTestModal={() => setIsTestModalOpen(true)}
            engineStatus={engineStatus}
          />
        )}

        {currentSection === 'analyze' && (
          <TrafficAnalyzer
            currentFlows={currentFlows}
            onFlowsUpdated={handleFlowsUpdated}
            onSendToAnalyst={handleSendToAnalyst}
            onNavigate={setCurrentSection}
          />
        )}

        {currentSection === 'url_scanner' && (
          <UrlThreatScanner
            onSendToAnalyst={handleSendToAnalyst}
            onNavigate={setCurrentSection}
          />
        )}

        {currentSection === 'port_scanner' && (
          <LivePortDetector
            onSendToAnalyst={handleSendToAnalyst}
            onNavigate={setCurrentSection}
          />
        )}

        {currentSection === 'ml_methods' && (
          <MlMethodsFeatures />
        )}

        {currentSection === 'monitor' && (
          <LiveMonitor />
        )}

        {currentSection === 'lab' && (
          <SecurityLab
            onInjectCase={handleInjectCase}
            onSendToAnalyst={handleSendToAnalyst}
            onNavigate={setCurrentSection}
          />
        )}

        {currentSection === 'analyst' && (
          <AISecurityAnalyst
            activeContext={activeContext}
            onClearContext={() => setActiveContext(null)}
            engineStatus={engineStatus}
          />
        )}

        {currentSection === 'history' && (
          <AlertHistoryView />
        )}

        {currentSection === 'model_info' && (
          <ModelInfoHelp />
        )}

        {currentSection === 'about_me' && (
          <AboutMe onNavigate={setCurrentSection} />
        )}
      </main>

      {/* Diagnostic & Demo Test Modal */}
      <DemoTestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Clean Cyber Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">INIDA-ML</span>
            <span>·</span>
            <span>Network Intrusion Detection & Threat Analysis Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>CIC-IDS2017 Benchmark</span>
            <span>·</span>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              System Self-Test
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentSection('model_info')}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Model Specs
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentSection('about_me')}
              className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
            >
              About Me
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
