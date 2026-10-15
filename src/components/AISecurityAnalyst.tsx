import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Bot, Send, ShieldAlert, Sparkles, Terminal, AlertTriangle, CheckCircle, RefreshCw, X, Globe } from 'lucide-react';

interface AISecurityAnalystProps {
  activeContext: any | null;
  onClearContext: () => void;
  engineStatus: { configured: boolean; verified: boolean; model: string; status?: string };
}

export const AISecurityAnalyst: React.FC<AISecurityAnalystProps> = ({
  activeContext,
  onClearContext,
  engineStatus
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am your AI Security Incident Analyst for INIDA-ML.

I can explain machine learning predictions on network flows, analyze suspicious website links, correlate protocol attributes (such as SYN/FIN ratios and inter-arrival times), map detected behaviors to the MITRE ATT&CK matrix, and generate concrete firewall ACLs or Snort/Suricata rules.

Ask me about any flow anomaly, paste a URL to assess, or select one of the suggested security queries below.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEngine, setSelectedEngine] = useState<string>('neural-primary');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeContext) {
      if (activeContext.type === 'URL_SECURITY_SCAN') {
        setInputPrompt(`Perform a deep cybersecurity threat analysis on this URL: ${activeContext.url} (Classification: ${activeContext.classification}, Risk Score: ${activeContext.riskScore}). Identify potential phishing vectors, domain evasion techniques, and DNS/firewall mitigation rules.`);
      } else {
        setInputPrompt(`Analyze the attached flow (${activeContext.id} - ${activeContext.predictedLabel}). Explain its anomalous characteristics, map to MITRE ATT&CK, and provide defensive mitigation steps.`);
      }
    }
  }, [activeContext]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: activeContext ? activeContext : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage(`Error querying security engine: ${err.message}`);
      const errorBotMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Failed to complete AI incident response query: ${err.message}. Please verify server network connectivity and engine status.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorBotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Explain why training on Monday Benign data alone causes 0% attack recall.',
    'Explain the Slowloris DoS flow profile: why does low throughput starve web servers?',
    'How do malicious phishing URLs use deceptive subdomains and special characters?',
    'Provide Suricata and iptables rules to block TCP SYN Flood attacks.',
    'What features in CIC-IDS2017 are most discriminative for detecting PortScans?'
  ];

  return (
    <div className="space-y-4">
      {/* Top Status & Engine Profile */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AI Security Analyst</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {engineStatus.verified ? 'Verified Active' : 'Online / Ready'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Automated Incident Advisory & Threat Correlation
            </span>
          </div>
        </div>

        {/* Engine mode selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Analysis Engine:</span>
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="neural-primary">High-Capacity Threat Engine</option>
            <option value="neural-fast">Fast Incident Response Engine</option>
          </select>
        </div>
      </div>

      {/* Active Context Banner */}
      {activeContext && (
        <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-200 truncate">
            {activeContext.type === 'URL_SECURITY_SCAN' ? (
              <>
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Attached Target URL: <strong>{activeContext.url}</strong> (Classification: {activeContext.classification} · Risk Score: {activeContext.riskScore})
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Attached Flow: <strong>{activeContext.id}</strong> (Port {activeContext.destinationPort} · {activeContext.predictedLabel} · Score: {activeContext.anomalyScore})
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClearContext}
            className="text-cyan-400 hover:text-cyan-200 p-1 cursor-pointer shrink-0"
            title="Detach context"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="border border-slate-800 rounded-lg bg-slate-950 flex flex-col h-[460px]">
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                  <span>{isUser ? 'You' : 'INIDA Security Analyst'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3.5 leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-cyan-950/80 text-cyan-100 border border-cyan-800/80'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 italic">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing security indicators and generating defense runbook...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Query Suggestions */}
        <div className="border-t border-slate-800/80 bg-slate-900/60 p-2.5 overflow-x-auto flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 shrink-0 font-mono text-[10px] uppercase">Templates:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded border border-slate-700/70 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI analyst about flow features, attacks, malicious URLs, or defense..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
