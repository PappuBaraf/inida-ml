import React from 'react';
import { PageSection } from '../types';
import { 
  User, GraduationCap, BookOpen, Code2, Shield, 
  Terminal, Cpu, Cloud, Target, ArrowRight, Sparkles,
  ExternalLink, CheckCircle2, Award
} from 'lucide-react';

interface AboutMeProps {
  onNavigate: (section: PageSection) => void;
}

export const AboutMe: React.FC<AboutMeProps> = ({ onNavigate }) => {
  const technicalInterests = [
    { 
      title: 'Artificial Intelligence and Machine Learning', 
      icon: Cpu, 
      desc: 'Supervised & unsupervised models, ensemble random forests, tabular anomaly detection, and evaluation metrics.' 
    },
    { 
      title: 'Generative AI and Large Language Models', 
      icon: Sparkles, 
      desc: 'Context-grounded reasoning engines, automated incident advisory, prompt engineering, and intelligent assistance.' 
    },
    { 
      title: 'Python and Data Science', 
      icon: Terminal, 
      desc: 'Pandas, NumPy, Scikit-Learn, PyArrow, data preprocessing pipelines, and exploratory flow analysis.' 
    },
    { 
      title: 'Cybersecurity and Network Intrusion Detection', 
      icon: Shield, 
      desc: 'Network flow analysis (CIC-IDS2017), attack signature recognition, MITRE ATT&CK mapping, and threat hunting.' 
    },
    { 
      title: 'Web Application Development', 
      icon: Code2, 
      desc: 'Modern responsive full-stack architectures, interactive analytical dashboards, telemetry, and real-time visualization.' 
    },
    { 
      title: 'Cloud Computing and Software Engineering', 
      icon: Cloud, 
      desc: 'REST APIs, secure deployments, robust validation guards, modular software architectures, and automated testing.' 
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/60 p-6 lg:p-8 relative overflow-hidden shadow-lg shadow-black/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-cyan-400 shadow-xl shadow-cyan-950/80 bg-slate-900 ring-4 ring-cyan-500/20">
              <img
                src="/profile.jpg"
                alt="Pappu Baraf - Computer Engineering Student"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>DEVELOPER PROFILE</span>
              <span aria-hidden="true">·</span>
              <span>ENGINEERING PORTFOLIO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pappu Baraf
            </h1>
            <p className="text-sm font-medium text-cyan-300 font-mono">
              Computer Engineering Student | Artificial Intelligence & Machine Learning Enthusiast
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Finolex Academy of Management and Technology, Ratnagiri (Affiliated with Mumbai University)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            I am a final-year Bachelor of Engineering student specializing in <strong className="text-white">Computer Science and Engineering with Artificial Intelligence and Machine Learning</strong> at Finolex Academy of Management and Technology, Ratnagiri, affiliated with Mumbai University.
          </p>
          <p>
            I am passionate about machine learning, generative AI, software development, and cybersecurity. I enjoy building practical projects that apply AI and data science to real-world problems.
          </p>
        </div>
      </div>

      {/* About My Project Section */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">About My Project</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">INIDA-ML (Intelligent Network Intrusion Detection and Anomaly Analysis Using Machine Learning)</strong> is an academic project focused on analyzing network traffic and identifying potentially suspicious activity using machine learning. The project combines a trained classification model, data visualization, and a Groq-powered AI assistant to help explain detection results.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>01. Flow Analytics</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Ingestion and schema validation of 77 tabular network flow dimensions from the benchmark CIC-IDS2017 dataset.
            </p>
          </div>
          <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>02. Threat Inspection</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Detection of volumetric floods, DoS Slowloris, PortScan probes, and malicious URL / website phishing links.
            </p>
          </div>
          <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800/90 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>03. AI Incident Advisor</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Automated Groq-accelerated SOC assistant providing contextual incident response runbooks mapped to MITRE ATT&CK.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Interests Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Technical Interests</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicalInterests.map((interest, idx) => {
            const Icon = interest.icon;
            return (
              <div 
                key={idx}
                className="border border-slate-800 rounded-lg bg-slate-900/30 p-4 space-y-2 hover:border-cyan-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white leading-snug">{interest.title}</h3>
                <p className="text-[11px] text-slate-400 leading-normal">{interest.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Goal Card */}
      <div className="border border-cyan-800/60 rounded-lg bg-gradient-to-r from-cyan-950/50 via-slate-900/70 to-slate-900/90 p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-300">
          <Target className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold tracking-tight text-white">Project Goal</h2>
        </div>

        <blockquote className="border-l-2 border-cyan-400 pl-4 py-1 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
          "My goal is to strengthen my practical engineering skills by developing reliable, understandable, and useful AI-powered applications while continuing to learn about machine learning, cybersecurity, and modern software technologies."
        </blockquote>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('overview')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>Explore INIDA-ML Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            Launch Traffic Analyzer
          </button>
          <button
            onClick={() => onNavigate('ml_methods')}
            className="px-4 py-2 text-xs font-medium text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/70 rounded transition-colors cursor-pointer"
          >
            View ML Methods & Features
          </button>
        </div>
      </div>
    </div>
  );
};
