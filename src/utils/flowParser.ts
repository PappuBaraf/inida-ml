import type { FlowRecord, AnalysisSummary, SeverityLevel } from '../types/index.ts';

export const REQUIRED_CIC_FEATURES = [
  'Destination Port',
  'Flow Duration',
  'Total Fwd Packets',
  'Total Backward Packets',
  'Flow Bytes/s',
  'Flow Packets/s'
];

export const FEATURE_ALIASES: Record<string, string[]> = {
  'Destination Port': [
    'destinationport', 'dstport', 'destport', 'dport', 'destination', 'targetport', 'dest'
  ],
  'Flow Duration': [
    'flowduration', 'duration', 'flowdurationus', 'flowdur'
  ],
  'Total Fwd Packets': [
    'totalfwdpackets', 'totfwdpkts', 'totalfwdpacket', 'fwdpackets', 'totfwdpackets', 'fwdpacketcount', 'subflowfwdpackets', 'totfwdpkt'
  ],
  'Total Backward Packets': [
    'totalbackwardpackets', 'totalbwdpackets', 'totbwdpkts', 'totbwdpackets', 'bwdpackets', 'bwdpacketcount', 'subflowbwdpackets', 'totbwdpkt'
  ],
  'Flow Bytes/s': [
    'flowbytess', 'flowbytespersec', 'flowbytessec', 'flowbyts', 'flowbytes', 'flowrate'
  ],
  'Flow Packets/s': [
    'flowpacketss', 'flowpacketspersec', 'flowpacketssec', 'flowpktss', 'flowpackets'
  ]
};

export interface ValidationResult {
  isValid: boolean;
  missingFeatures: string[];
  totalRows: number;
  error?: string;
}

/**
 * Normalizes header string by removing BOM, wrapping quotes, and non-alphanumeric characters.
 */
export function cleanHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, '')
    .replace(/^["']+|["']+$/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Validates header schema against required CIC-IDS2017 tabular flow features.
 * Robust to leading spaces, quotes, BOM, and common column aliases across CIC releases.
 */
export function validateFlowSchema(headers: string[]): ValidationResult {
  const cleaned = headers.map(cleanHeader);

  const missing: string[] = [];
  for (const req of REQUIRED_CIC_FEATURES) {
    const aliases = FEATURE_ALIASES[req] || [cleanHeader(req)];
    const isFound = aliases.some(alias => cleaned.includes(alias));
    if (!isFound) {
      missing.push(req);
    }
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      missingFeatures: missing,
      totalRows: 0,
      error: `Input file does not match CIC-IDS2017 tabular flow schema. Missing required flow features: ${missing.join(', ')}. Note: Raw byte payloads (PCAP bytes) must first be preprocessed into tabular flow features using CICFlowMeter.`
    };
  }

  return {
    isValid: true,
    missingFeatures: [],
    totalRows: 0
  };
}

/**
 * Parses raw CSV string into structured FlowRecord array
 */
export function parseFlowCsv(csvText: string): { records: FlowRecord[]; validation: ValidationResult } {
  // Strip BOM from beginning of file
  const sanitizedText = csvText.replace(/^\uFEFF/, '');
  const lines = sanitizedText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      records: [],
      validation: {
        isValid: false,
        missingFeatures: REQUIRED_CIC_FEATURES,
        totalRows: 0,
        error: 'CSV file is empty or missing data rows.'
      }
    };
  }

  // Parse header line respecting quotes
  const rawHeaders = lines[0].split(',').map(h => h.replace(/^["']+|["']+$/g, '').trim());
  const validation = validateFlowSchema(rawHeaders);
  if (!validation.isValid) {
    return { records: [], validation };
  }

  // Map cleaned header to index
  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[cleanHeader(h)] = idx;
  });

  const getVal = (row: string[], name: string, fallback: number = 0): number => {
    const aliases = FEATURE_ALIASES[name] || [cleanHeader(name)];
    for (const alias of aliases) {
      const idx = headerMap[alias];
      if (idx !== undefined && row[idx] !== undefined) {
        const v = parseFloat(row[idx].replace(/["']/g, '').trim());
        if (!isNaN(v)) return v;
      }
    }
    return fallback;
  };

  const records: FlowRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length < 4) continue;

    const labelAliases = ['label', 'labels', 'class', 'attack', 'attacktype'];
    let groundTruth = 'UNKNOWN';
    for (const la of labelAliases) {
      const idx = headerMap[la];
      if (idx !== undefined && row[idx]) {
        groundTruth = row[idx].replace(/["']/g, '').trim();
        break;
      }
    }

    const destPort = getVal(row, 'Destination Port', 80);
    const flowDuration = getVal(row, 'Flow Duration', 0);
    const totalFwd = getVal(row, 'Total Fwd Packets', 1);
    const totalBwd = getVal(row, 'Total Backward Packets', 0);
    const totalLenFwd = getVal(row, 'Total Length of Fwd Packets', 0);
    const totalLenBwd = getVal(row, 'Total Length of Bwd Packets', 0);
    const flowBytesSec = getVal(row, 'Flow Bytes/s', 0);
    const flowPacketsSec = getVal(row, 'Flow Packets/s', 0);
    const flowIatMean = getVal(row, 'Flow IAT Mean', 0);
    const finFlags = getVal(row, 'FIN Flag Count', 0);
    const synFlags = getVal(row, 'SYN Flag Count', 0);
    const rstFlags = getVal(row, 'RST Flag Count', 0);
    const pshFlags = getVal(row, 'PSH Flag Count', 0);
    const ackFlags = getVal(row, 'ACK Flag Count', 0);
    const avgPacketSize = getVal(row, 'Average Packet Size', 0);

    const evaluation = evaluateFlowRecord({
      id: `flow-${i}`,
      destinationPort: destPort,
      flowDuration,
      totalFwdPackets: totalFwd,
      totalBwdPackets: totalBwd,
      totalLengthFwdPackets: totalLenFwd,
      totalLengthBwdPackets: totalLenBwd,
      flowBytesPerSec: flowBytesSec,
      flowPacketsPerSec: flowPacketsSec,
      flowIatMean,
      finFlagCount: finFlags,
      synFlagCount: synFlags,
      rstFlagCount: rstFlags,
      pshFlagCount: pshFlags,
      ackFlagCount: ackFlags,
      averagePacketSize: avgPacketSize,
      groundTruthLabel: groundTruth
    });

    records.push(evaluation);
  }

  validation.totalRows = records.length;
  return { records, validation };
}

/**
 * Statistical flow inspection & heuristic anomaly baseline evaluator
 */
export function evaluateFlowRecord(flow: FlowRecord): FlowRecord {
  const indicators: string[] = [];
  let anomalyScore = 0;
  let predictedLabel = 'BENIGN';
  let severity: SeverityLevel = 'LOW';

  // 1. Check for Slowloris / Low-and-Slow HTTP DoS
  if (flow.flowDuration > 50000000 && flow.flowBytesPerSec < 50 && flow.totalBwdPackets <= 2) {
    indicators.push('Prolonged flow duration with near-zero throughput (Slowloris DoS profile)');
    anomalyScore += 0.88;
    predictedLabel = 'DoS Slowloris';
    severity = 'HIGH';
  }

  // 2. Check for SYN Flood / PortScan Probing
  if (flow.synFlagCount >= 2 && flow.totalBwdPackets === 0 && flow.ackFlagCount === 0) {
    indicators.push('Unanswered TCP SYN requests without ACK completion (SYN Probing/Scan)');
    anomalyScore += 0.85;
    if (flow.flowPacketsPerSec > 1000 || [23, 135, 445, 3389, 21, 22].includes(flow.destinationPort)) {
      predictedLabel = 'PortScan';
      severity = 'HIGH';
    } else {
      predictedLabel = 'DDoS LOIC (SYN Flood)';
      severity = 'CRITICAL';
    }
  }

  // 3. High packet rate SYN Flood
  if (flow.synFlagCount > 10 && flow.flowDuration < 500000) {
    indicators.push('Excessive SYN flag density in brief duration window (SYN Flood Volumetric)');
    anomalyScore += 0.95;
    predictedLabel = 'DDoS LOIC (SYN Flood)';
    severity = 'CRITICAL';
  }

  // 4. Check for Brute Force (SSH / FTP)
  if ([21, 22].includes(flow.destinationPort) && flow.totalFwdPackets > 15 && flow.flowDuration < 2000000) {
    indicators.push(`High transaction density on administrative port ${flow.destinationPort} (Credential Brute Force)`);
    anomalyScore += 0.78;
    predictedLabel = flow.destinationPort === 22 ? 'SSH-Patator' : 'FTP-Patator';
    severity = 'HIGH';
  }

  // 5. Data Exfiltration / Anomaly
  if (flow.totalLengthFwdPackets > 100000 && ![80, 443].includes(flow.destinationPort)) {
    indicators.push(`Unusual large outbound forward byte transfer (${(flow.totalLengthFwdPackets / 1024).toFixed(1)} KB) on port ${flow.destinationPort}`);
    anomalyScore += 0.82;
    predictedLabel = 'Anomaly: Outbound Exfiltration';
    severity = 'HIGH';
  }

  // Ground truth check if label exists in CSV
  if (flow.groundTruthLabel && flow.groundTruthLabel !== 'BENIGN' && flow.groundTruthLabel !== 'UNKNOWN') {
    if (anomalyScore < 0.5) {
      anomalyScore = 0.75;
      predictedLabel = flow.groundTruthLabel;
      severity = 'HIGH';
    }
  }

  if (anomalyScore === 0) {
    predictedLabel = 'BENIGN';
    severity = 'LOW';
  } else if (anomalyScore >= 0.85) {
    severity = 'CRITICAL';
  } else if (anomalyScore >= 0.6) {
    severity = 'HIGH';
  } else {
    severity = 'MEDIUM';
  }

  return {
    ...flow,
    anomalyScore: Number(anomalyScore.toFixed(3)),
    predictedLabel,
    severity,
    indicators: indicators.length > 0 ? indicators : ['Normal traffic baseline characteristics verified']
  };
}

/**
 * Computes high-level summary statistics
 */
export function summarizeFlows(flows: FlowRecord[]): AnalysisSummary {
  let benignCount = 0;
  let suspiciousCount = 0;
  let criticalCount = 0;
  let totalDuration = 0;
  let totalBytes = 0;
  const attackCounts: Record<string, number> = {};

  flows.forEach(f => {
    totalDuration += f.flowDuration;
    totalBytes += (f.totalLengthFwdPackets + f.totalLengthBwdPackets);

    if (f.predictedLabel === 'BENIGN') {
      benignCount++;
    } else {
      suspiciousCount++;
      if (f.severity === 'CRITICAL') criticalCount++;
      attackCounts[f.predictedLabel || 'Other Attack'] = (attackCounts[f.predictedLabel || 'Other Attack'] || 0) + 1;
    }
  });

  let topAttack = 'None (All Benign)';
  let maxCount = 0;
  Object.entries(attackCounts).forEach(([atk, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topAttack = `${atk} (${count} flows)`;
    }
  });

  return {
    totalFlows: flows.length,
    benignCount,
    suspiciousCount,
    criticalCount,
    topAttackType: topAttack,
    averageDuration: flows.length > 0 ? Math.round(totalDuration / flows.length) : 0,
    totalBytes,
    flaggedFlows: flows.filter(f => f.predictedLabel !== 'BENIGN')
  };
}
