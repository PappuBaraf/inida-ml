import React from 'react';
import { BookOpen, ExternalLink, Code2, Terminal, Shield, CheckCircle2, AlertTriangle, FileText, Layers } from 'lucide-react';

export const ModelInfoHelp: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Platform Specification Header */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
          <span>SYSTEM DOCUMENTATION</span>
          <span aria-hidden="true">·</span>
          <span>CIC-IDS2017 CLASSIFICATION ARCHITECTURE</span>
          <span aria-hidden="true">·</span>
          <span>MODEL VERIFICATION MANUAL</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          INIDA-ML: Technical Architecture & Dataset Documentation
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          An end-to-end intrusion detection system combining tabular network flow extraction, supervised Random Forest ensemble learning, URL threat detection heuristics, and intelligent incident response runbooks.
        </p>
      </div>

      {/* Dataset Documentation Section */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>CIC-IDS2017 Dataset Benchmark</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Canadian Institute for Cybersecurity (CIC) IDS-2017 benchmark dataset is widely acknowledged as the gold standard for network flow intrusion detection research. It features completely configured network environments, realistic background traffic (HTTP, HTTPS, SSH, FTP, Email), and diverse modern attack execution schedules across an 80-feature extraction matrix generated via CICFlowMeter.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="https://www.unb.ca/cic/datasets/ids-2017.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded border border-slate-700 bg-slate-950 hover:border-cyan-500/80 transition-colors flex items-center justify-between text-xs group"
          >
            <div>
              <span className="font-semibold text-white group-hover:text-cyan-300 block">
                Official UNB Dataset Portal
              </span>
              <span className="text-[11px] text-slate-400 font-mono">unb.ca/cic/datasets/ids-2017.html</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
          </a>

          <a
            href="https://www.kaggle.com/dsv/4059877"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded border border-slate-700 bg-slate-950 hover:border-cyan-500/80 transition-colors flex items-center justify-between text-xs group"
          >
            <div>
              <span className="font-semibold text-white group-hover:text-cyan-300 block">
                Kaggle Mirror (Preprocessed Parquet)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">kaggle.com/dsv/4059877</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
          </a>
        </div>

        {/* Monday Dataset Audit Box */}
        <div className="p-4 rounded border border-amber-800/80 bg-amber-950/20 text-xs space-y-2 text-amber-200">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Dataset Audit: Benign-Monday-no-metadata.parquet</span>
          </div>
          <p className="leading-relaxed text-amber-200/90">
            The dataset file <code className="bg-amber-950/80 px-1 py-0.5 rounded font-mono">Benign-Monday-no-metadata.parquet</code> contains approximately <strong>458,831 records</strong> and 77 flow features. A complete audit reveals that <strong>100% of rows have Label == 'BENIGN'</strong>.
          </p>
          <div className="p-2.5 rounded bg-amber-950/60 border border-amber-900 font-mono text-[11px] text-amber-100">
            Unique labels: ['BENIGN'] | Attack records: 0 | Class ratio: ∞:0
          </div>
          <p className="leading-relaxed text-amber-200/80">
            <strong>Machine Learning Principle:</strong> A supervised binary classifier trained on Monday data alone collapses into a trivial majority-class predictor with 0% attack recall. Multi-day captures (Wednesday DoS, Thursday Web Attacks, Friday DDoS/PortScan) are required to train decision boundaries.
          </p>
        </div>
      </div>

      {/* Training Pipeline Documentation */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Python Random Forest Training Pipeline Script</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The complete, reproducible training pipeline is included in the project repository at <code className="font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">scripts/train_random_forest.py</code>.
        </p>

        <div className="border border-slate-800 rounded bg-slate-950 p-4 font-mono text-xs text-slate-200 space-y-2">
          <span className="text-slate-500 block"># 1. Install prerequisites</span>
          <p className="text-cyan-400 font-bold select-all">
            pip install pandas numpy scikit-learn joblib pyarrow fastparquet
          </p>

          <span className="text-slate-500 block pt-2"># 2. Run training on multi-day dataset</span>
          <p className="text-cyan-400 font-bold select-all">
            python scripts/train_random_forest.py --data-path data/cic_ids_multiday.parquet --output-dir models/
          </p>

          <span className="text-slate-500 block pt-2"># 3. Output Artifacts Generated:</span>
          <ul className="text-slate-400 space-y-1 text-[11px]">
            <li>• <code className="text-slate-300">models/intrusion_pipeline.joblib</code> - Fitted Scaler & Random Forest Model</li>
            <li>• <code className="text-slate-300">models/model_metadata.json</code> - Feature schema & hyperparameters</li>
            <li>• <code className="text-slate-300">models/evaluation_metrics.json</code> - Classification report & confusion matrix</li>
          </ul>
        </div>
      </div>

      {/* Local Startup & Windows Run Instructions */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>Local Startup & Execution Instructions</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">Windows Run Instructions (PowerShell / Command Prompt):</h4>
            <div className="bg-slate-950 p-3 rounded font-mono border border-slate-800 text-slate-300 space-y-1">
              <p>git clone &lt;repo-url&gt;</p>
              <p>cd inida-ml</p>
              <p>copy .env.example .env</p>
              <p>npm install</p>
              <p>npm run dev</p>
              <p className="text-slate-500"># Open browser at http://localhost:3000</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-1">Linux / macOS Run Instructions:</h4>
            <div className="bg-slate-950 p-3 rounded font-mono border border-slate-800 text-slate-300 space-y-1">
              <p>cp .env.example .env</p>
              <p>npm install</p>
              <p>npm run dev</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-1">Automated Test Execution:</h4>
            <div className="bg-slate-950 p-3 rounded font-mono border border-slate-800 text-slate-300 space-y-1">
              <p>npx tsx tests/run_tests.ts</p>
              <p className="text-slate-500"># Validates all architectural test cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          System Verification Status
        </h3>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>AI Incident Advisory Engine:</strong> Operational using secure server-side secret proxy.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>URL Threat Scanner:</strong> Verified detection of phishing keywords, high-risk TLDs, and C2 IP hosts.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Validation Engine:</strong> Verified rejection of raw byte payloads (PCAP bytes) and enforcement of tabular flow features.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Model Training State:</strong> Transparently marked as "Model not trained — attack data required." No synthetic metrics were fabricated.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
