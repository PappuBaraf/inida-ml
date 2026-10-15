export type PageSection = 
  | 'overview' 
  | 'analyze' 
  | 'url_scanner'
  | 'port_scanner'
  | 'ml_methods'
  | 'monitor' 
  | 'lab' 
  | 'analyst' 
  | 'history' 
  | 'model_info'
  | 'about_me';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FlowRecord {
  id: string;
  destinationPort: number;
  flowDuration: number;
  totalFwdPackets: number;
  totalBwdPackets: number;
  totalLengthFwdPackets: number;
  totalLengthBwdPackets: number;
  flowBytesPerSec: number;
  flowPacketsPerSec: number;
  flowIatMean: number;
  finFlagCount: number;
  synFlagCount: number;
  rstFlagCount: number;
  pshFlagCount: number;
  ackFlagCount: number;
  averagePacketSize: number;
  groundTruthLabel?: string;
  predictedLabel?: string;
  anomalyScore?: number;
  severity?: SeverityLevel;
  indicators?: string[];
  rawRow?: Record<string, any>;
}

export interface AnalysisSummary {
  totalFlows: number;
  benignCount: number;
  suspiciousCount: number;
  criticalCount: number;
  topAttackType: string;
  averageDuration: number;
  totalBytes: number;
  flaggedFlows: FlowRecord[];
}

export interface SecurityTestCase {
  id: string;
  name: string;
  category: 'DoS' | 'Scan' | 'BruteForce' | 'Exfiltration' | 'Benign';
  mitreTechnique: string;
  description: string;
  expectedClassification: string;
  severity: SeverityLevel;
  flowSample: Partial<FlowRecord>;
}

export interface AlertHistoryItem {
  id: string;
  timestamp: string;
  filename: string;
  totalFlows: number;
  benignFlows: number;
  suspiciousFlows: number;
  highSeverityFlows: number;
  topAttackType: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface UrlScanResult {
  url: string;
  protocol: string;
  hostname: string;
  port: string;
  riskScore: number;
  classification: string;
  severity: SeverityLevel;
  indicators: string[];
  scannedAt: string;
}

export interface PortItem {
  port: number;
  service: string;
  state: 'OPEN' | 'CLOSED' | 'FILTERED';
  risk: SeverityLevel;
  securityNotes: string;
  latencyMs: number;
}

export interface PortScanResult {
  targetHost: string;
  totalPortsScanned: number;
  openPortsCount: number;
  criticalOpenCount: number;
  scannedAt: string;
  ports: PortItem[];
}

export interface MlFeatureItem {
  name: string;
  category: 'Timing & Flow' | 'Volume & Throughput' | 'Packet Statistics' | 'TCP Protocol Flags' | 'Window & Subflows';
  description: string;
  importanceRank: number;
  dataType: 'Continuous (Float)' | 'Discrete (Integer)' | 'Binary Flag';
  discriminativeRole: string;
}

export interface DiagnosticCheckItem {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
}

export interface DiagnosticReport {
  overallStatus: string;
  timestamp: string;
  checks: DiagnosticCheckItem[];
}
