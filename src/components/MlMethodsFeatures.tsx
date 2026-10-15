import React, { useState, useRef } from 'react';
import { MlFeatureItem } from '../types';
import { cleanHeader, FEATURE_ALIASES } from '../utils/flowParser';
import { 
  Cpu, Database, Filter, Search, CheckCircle2, AlertTriangle, 
  UploadCloud, ArrowRight, Layers, FileCode, Sliders, Activity
} from 'lucide-react';

export const ML_METHODS_CATALOG: MlFeatureItem[] = [
  {
    name: 'Destination Port',
    category: 'Timing & Flow',
    description: 'Target TCP/UDP service port (e.g. 80 HTTP, 443 HTTPS, 22 SSH, 21 FTP, 445 SMB).',
    importanceRank: 1,
    dataType: 'Discrete (Integer)',
    discriminativeRole: 'Distinguishes service targeting, reconnaissance sweeps (PortScans), and admin brute forcing.'
  },
  {
    name: 'Flow Duration',
    category: 'Timing & Flow',
    description: 'Total duration of the bidirectional network conversation in microseconds (μs).',
    importanceRank: 2,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Key indicator for low-and-slow DoS attacks (Slowloris holds connections >60s with near-zero throughput).'
  },
  {
    name: 'Flow Bytes/s',
    category: 'Volume & Throughput',
    description: 'Data throughput velocity calculated as (Total Forward + Backward Payload Bytes) / Duration.',
    importanceRank: 3,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Spikes drastically during data exfiltration; collapses to 0.0 in slowloris starvation attacks.'
  },
  {
    name: 'Flow Packets/s',
    category: 'Volume & Throughput',
    description: 'Packet transmission rate (Total Packets / Duration).',
    importanceRank: 4,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Extreme values (>3000 pkts/s) characterize volumetric DoS/DDoS LOIC floods and rapid network scans.'
  },
  {
    name: 'SYN Flag Count',
    category: 'TCP Protocol Flags',
    description: 'Frequency of TCP SYN (Synchronize sequence numbers) control flags within the flow window.',
    importanceRank: 5,
    dataType: 'Discrete (Integer)',
    discriminativeRole: 'Elevated counts without corresponding ACK or data packets indicate SYN Flood DDoS or half-open stealth scans.'
  },
  {
    name: 'FIN Flag Count',
    category: 'TCP Protocol Flags',
    description: 'Frequency of TCP FIN (No more data from sender) orderly teardown flags.',
    importanceRank: 6,
    dataType: 'Discrete (Integer)',
    discriminativeRole: 'Abnormal termination states or teardown bursts help identify anomalous scanning signatures.'
  },
  {
    name: 'ACK Flag Count',
    category: 'TCP Protocol Flags',
    description: 'Frequency of TCP Acknowledgment flags validating received sequences.',
    importanceRank: 7,
    dataType: 'Discrete (Integer)',
    discriminativeRole: 'High ACK ratios represent completed stateful sessions; missing ACKs reveal asymmetric flood attacks.'
  },
  {
    name: 'Flow IAT Mean',
    category: 'Timing & Flow',
    description: 'Mean Inter-Arrival Time between consecutive packets within the flow (microseconds).',
    importanceRank: 8,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Highlights beaconing malware schedules (rigid interval loops) and slowloris keep-alive stalling.'
  },
  {
    name: 'Packet Length Mean',
    category: 'Packet Statistics',
    description: 'Mean length in bytes of all packets observed across forward and backward channels.',
    importanceRank: 9,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Zero or tiny packet lengths correlate with header-only flood attacks (SYN, ACK floods); large lengths signal file transfers.'
  },
  {
    name: 'Packet Length Variance',
    category: 'Packet Statistics',
    description: 'Statistical variance of packet payload sizes across the flow.',
    importanceRank: 10,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Normal human browsing exhibits high variance (small requests, large responses); automated scripts have near-zero variance.'
  },
  {
    name: 'Init_Win_bytes_forward',
    category: 'Window & Subflows',
    description: 'TCP initial sliding window advertising buffer size in forward transmission.',
    importanceRank: 11,
    dataType: 'Discrete (Integer)',
    discriminativeRole: 'OS-specific TCP stack fingerprinting; helps differentiate legitimate browsers from automated attacking tools.'
  },
  {
    name: 'Average Packet Size',
    category: 'Packet Statistics',
    description: 'Total volume divided by total packet count across the entire dialogue.',
    importanceRank: 12,
    dataType: 'Continuous (Float)',
    discriminativeRole: 'Detects anomalous tunneling (DNS tunneling payloads) and payload padding.'
  }
];

export const MlMethodsFeatures: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [uploadStatus, setUploadStatus] = useState<{
    tested: boolean;
    validFeaturesCount: number;
    totalColumns: number;
    missingRequired: string[];
    fileName: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFeatures = ML_METHODS_CATALOG.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.discriminativeRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCustomFeatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const sanitized = text.replace(/^\uFEFF/, '').trim();
      const lines = sanitized.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        // Strip BOM and clean headers
        const rawHeaders = lines[0].split(',').map(h => h.replace(/^["']+|["']+$/g, '').trim());
        const cleanedHeaders = rawHeaders.map(cleanHeader);

        const required = ['Destination Port', 'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets', 'Flow Bytes/s', 'Flow Packets/s'];
        const missing: string[] = [];
        let matchedCount = 0;

        for (const req of required) {
          const aliases = FEATURE_ALIASES[req] || [cleanHeader(req)];
          const isFound = aliases.some(alias => cleanedHeaders.includes(alias));
          if (isFound) {
            matchedCount++;
          } else {
            missing.push(req);
          }
        }

        setUploadStatus({
          tested: true,
          validFeaturesCount: matchedCount,
          totalColumns: rawHeaders.length,
          missingRequired: missing,
          fileName: file.name
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Layers className="w-4 h-4" />
          <span>MACHINE LEARNING ENGINE & FEATURE SPECIFICATION</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Machine Learning Methods & Feature Engineering
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Detailed technical specifications of the ensemble algorithms, feature scaling strategies, and 77-dimensional tabular flow extraction pipeline utilized in the INIDA-ML intrusion detection architecture.
        </p>
      </div>

      {/* Core Machine Learning Algorithms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-5 space-y-3">
          <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Random Forest Ensemble</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            100 uncorrelated decision trees trained with bootstrap aggregating (bagging) and randomized feature subsets. Gini impurity minimizes split entropy, offering high resilience to noise and non-linear protocol interactions.
          </p>
          <div className="text-[11px] font-mono text-cyan-300 pt-1 border-t border-slate-800">
            Hyperparameters: n_estimators=100, max_depth=25, criterion=gini
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-5 space-y-3">
          <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">StandardScaler Normalization</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuous variables (Flow Duration spanning millions of microseconds vs TCP flags ranging 0–50) are standardized to zero mean and unit variance ($z = (x - \mu) / \sigma$), preventing high-magnitude features from dominating splits.
          </p>
          <div className="text-[11px] font-mono text-emerald-300 pt-1 border-t border-slate-800">
            Continuous Flow Standardization: Unit Variance Scaling
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg bg-slate-900/30 p-5 space-y-3">
          <div className="w-8 h-8 rounded bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Class Weight Balancing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enforces <code className="font-mono text-amber-300">class_weight='balanced_subsample'</code> to adjust tree weights inversely proportional to class frequencies, preventing benign background dominance and protecting minority attack recall.
          </p>
          <div className="text-[11px] font-mono text-amber-300 pt-1 border-t border-slate-800">
            Loss Adjustment: Inversely Proportional Class Sampling
          </div>
        </div>
      </div>

      {/* Custom Dataset Schema Upload & Validator */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Feature Schema & Dataset Upload Validator</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload any tabular CSV dataset or feature header list to check compatibility against the 77-feature extraction pipeline.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Dataset to Validate Schema</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleCustomFeatureUpload}
            className="hidden"
          />
        </div>

        {uploadStatus && (
          <div className={`p-4 rounded-lg border text-xs space-y-2 ${
            uploadStatus.missingRequired.length === 0
              ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
          }`}>
            <div className="flex items-center justify-between font-semibold">
              <span>File Tested: {uploadStatus.fileName}</span>
              <span className="font-mono">{uploadStatus.totalColumns} Total Columns Detected</span>
            </div>
            {uploadStatus.missingRequired.length === 0 ? (
              <p className="text-emerald-300">
                ✓ Full compatibility verified! All mandatory CIC-IDS2017 flow dimensions are present and formatted correctly for model ingestion.
              </p>
            ) : (
              <p className="text-rose-300">
                ⚠ Schema mismatch: Missing required flow features: <strong className="font-mono">{uploadStatus.missingRequired.join(', ')}</strong>. Raw PCAP bytes must be processed with CICFlowMeter first.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Feature Catalog & Importance Table */}
      <div className="border border-slate-800 rounded-lg bg-slate-900/30 overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Discriminative Features Catalog (Top Extracted Predictors)
            </h3>
            <span className="text-xs text-slate-400">
              Derived from bidirectional flow tracking using CICFlowMeter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {['ALL', 'Timing & Flow', 'Volume & Throughput', 'TCP Protocol Flags', 'Packet Statistics', 'Window & Subflows'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feature Table */}
        <div className="overflow-x-auto border border-slate-800/80 rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Discriminative Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFeatures.map(item => (
                <tr key={item.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400 font-bold tabular-nums">#{item.importanceRank}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{item.name}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">{item.category}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{item.dataType}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-xs leading-normal">{item.discriminativeRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
