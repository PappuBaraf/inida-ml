import React from 'react';
import { PageSection } from '../types';
import { Shield, Sparkles, Globe, Layers, Radio, ShieldCheck } from 'lucide-react';

interface NavigationProps {
  currentSection: PageSection;
  onSelectSection: (section: PageSection) => void;
  onQuickAction: () => void;
  onOpenTestModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  onSelectSection,
  onQuickAction,
  onOpenTestModal
}) => {
  const navItems: { id: PageSection; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analyze', label: 'Analyze Flows' },
    { id: 'url_scanner', label: 'URL Scanner' },
    { id: 'port_scanner', label: 'Port Detection' },
    { id: 'ml_methods', label: 'ML Methods & Features' },
    { id: 'monitor', label: 'Live Monitor' },
    { id: 'lab', label: 'Security Lab' },
    { id: 'analyst', label: 'AI Analyst' },
    { id: 'history', label: 'Alert History' },
    { id: 'model_info', label: 'Docs' },
    { id: 'about_me', label: 'About Me' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#060b17]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <button
            onClick={() => onSelectSection('overview')}
            className="text-left group cursor-pointer"
          >
            <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              INIDA-ML
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-400 border-l border-slate-700 pl-2">
              Cybersecurity & Anomaly Platform
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden 2xl:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {item.id === 'about_me' && (
                  <img
                    src="/profile.jpg"
                    alt="Pappu Baraf"
                    className="w-4 h-4 rounded-full object-cover shrink-0 border border-cyan-400/80"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTestModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>System Self-Test</span>
          </button>
          <button
            onClick={onQuickAction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-sm shadow-cyan-950"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo</span>
          </button>
        </div>
      </div>

      {/* Subnav bar for screen widths below 2xl */}
      <div className="2xl:hidden border-t border-slate-800/80 bg-slate-950/90 px-4 py-2 overflow-x-auto flex items-center gap-1.5">
        {navItems.map(item => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.id === 'about_me' && (
                <img
                  src="/profile.jpg"
                  alt="Pappu Baraf"
                  className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-cyan-400/80"
                  referrerPolicy="no-referrer"
                />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onOpenTestModal}
          className="sm:hidden px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950 border border-cyan-800 rounded whitespace-nowrap"
        >
          Self-Test
        </button>
      </div>
    </header>
  );
};
