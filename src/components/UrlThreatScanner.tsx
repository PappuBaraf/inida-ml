import React, { useState } from 'react';
import { UrlScanResult, PageSection } from '../types';
import { 
  Globe, Shield, AlertTriangle, CheckCircle2, ShieldAlert, 
  ExternalLink, ArrowRight, Bot, Download, RefreshCw, Lock, Unlock
} from 'lucide-react';

interface UrlThreatScannerProps {
  onSendToAnalyst: (context: any) => void;
  onNavigate: (section: PageSection) => void;
}

export const UrlThreatScanner: React.FC<UrlThreatScannerProps> = ({
  onSendToAnalyst,
  onNavigate
}) => {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<UrlScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleLinks = [
    {
      label: 'Phishing Impersonation',
      url: 'http://update-secure-banking.xyz/login.php?token=92847',
      desc: 'Insecure HTTP with banking keywords on high-abuse .xyz TLD'
    },
    {
      label: 'Malware C2 Raw IP',
      url: 'http://185.220.101.5:8080/dropper.exe',
      desc: 'Raw IP host with non-standard port serving executable payload'
    },
    {
      label: 'URL Obfuscation Trick',
      url: 'http://user:pass@paypal-verify.account-update.tk/signin',
      desc: '@ delimiter mask with excessive subdomains on .tk'
    },
    {
      label: 'Legitimate HTTPS Link',
      url: 'https://wikipedia.org/wiki/Network_security',
      desc: 'Standard trusted domain with valid HTTPS protocol'
    }
  ];

  const handleScan = async (targetUrl?: string) => {
    const urlToTest = (targetUrl || inputUrl).trim();
    if (!urlToTest) return;

    setErrorMsg(null);
    setIsScanning(true);

    try {
      const response = await fetch('/api/url/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToTest })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan URL');
      }

      setScanResult(data);
      if (targetUrl) setInputUrl(targetUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while scanning URL');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportJson = () => {
    if (!scanResult) return;
    const jsonStr = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `URL_Threat_Scan_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Globe className="w-4 h-4" />
          <span>WEB REPUTATION & MALICIOUS LINK DETECTOR</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Website & URL Threat Scanner
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Inspect any website link or IP URL in real-time to detect phishing traps, domain generation algorithms (DGA), credential harvesting tricks, and command & control (C2) hosts.
        </p>

        {/* URL Input Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Paste website link or IP (e.g. https://example.com, http://bank-verify.xyz/login)..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScan();
              }}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <button
            onClick={() => handleScan()}
            disabled={isScanning || !inputUrl.trim()}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            {isScanning ? 'Inspecting Link...' : 'Detect Threat'}
          </button>
        </div>

        {/* Quick Sample Links Strip */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Quick Test Threat Links:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleLinks.map((sl, i) => (
              <button
                key={i}
                onClick={() => handleScan(sl.url)}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer text-left"
              >
                <span className="font-semibold text-cyan-300 block">{sl.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">{sl.url}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Scan Results Card */}
      {scanResult && (
        <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-6 space-y-6">
          {/* Verdict Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono text-slate-400">INSPECTION VERDICT</span>
              <div className="flex items-center gap-3 mt-1">
                {scanResult.severity === 'LOW' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : scanResult.severity === 'CRITICAL' ? (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${
                    scanResult.severity === 'LOW' 
                      ? 'text-emerald-400' 
                      : scanResult.severity === 'CRITICAL' 
                        ? 'text-rose-400' 
                        : 'text-amber-400'
                  }`}>
                    {scanResult.classification}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono truncate block max-w-xl">
                    {scanResult.url}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => {
                  onSendToAnalyst({
                    type: 'URL_SECURITY_SCAN',
                    url: scanResult.url,
                    classification: scanResult.classification,
                    riskScore: scanResult.riskScore,
                    indicators: scanResult.indicators
                  });
                  onNavigate('analyst');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Deep Scan with AI</span>
              </button>
            </div>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Calculated Risk Score</span>
              <span className={`text-lg font-bold ${
                scanResult.riskScore > 0.6 ? 'text-rose-400' : scanResult.riskScore > 0.3 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {scanResult.riskScore.toFixed(2)} / 1.00
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Protocol Security</span>
              <span className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                {scanResult.protocol === 'https:' ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">HTTPS (TLS)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">HTTP (Plain)</span>
                  </>
                )}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Target Hostname</span>
              <span className="text-cyan-300 text-sm truncate block">{scanResult.hostname}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Service Port</span>
              <span className="text-white text-sm">{scanResult.port}</span>
            </div>
          </div>

          {/* Detailed Indicator Explanations */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Lexical & Behavioral Threat Indicators Identified:
            </span>
            <div className="space-y-2">
              {scanResult.indicators.map((ind, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded border text-xs flex items-start gap-2.5 ${
                    scanResult.severity === 'LOW'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-cyan-400 font-mono text-[11px] shrink-0 mt-0.5">#{i + 1}</span>
                  <p className="leading-relaxed">{ind}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
