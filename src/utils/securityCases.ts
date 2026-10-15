import { SecurityTestCase } from '../types';

export const SECURITY_LAB_CASES: SecurityTestCase[] = [
  {
    id: 'case-dos-slowloris',
    name: 'DoS Slowloris Connection Starvation',
    category: 'DoS',
    mitreTechnique: 'T1498.001 - Direct Network Flood / Connection Starvation',
    description: 'Sends incomplete HTTP GET requests with extreme inter-arrival times (keep-alive headers) to hold server sockets open indefinitely until the thread pool exhausts.',
    expectedClassification: 'DoS Slowloris',
    severity: 'HIGH',
    flowSample: {
      destinationPort: 80,
      flowDuration: 120500000, // ~120 seconds
      totalFwdPackets: 18,
      totalBwdPackets: 0,
      totalLengthFwdPackets: 0,
      totalLengthBwdPackets: 0,
      flowBytesPerSec: 0.0,
      flowPacketsPerSec: 0.15,
      flowIatMean: 6694444.0,
      synFlagCount: 18,
      ackFlagCount: 0,
      finFlagCount: 0,
      averagePacketSize: 0
    }
  },
  {
    id: 'case-portscan-recon',
    name: 'TCP SYN Stealth PortScan Probe',
    category: 'Scan',
    mitreTechnique: 'T1046 - Network Service Scanning',
    description: 'Probes common administration and SMB ports (23, 135, 445, 3389) sending standalone SYN flags without completing the 3-way handshake to map open services.',
    expectedClassification: 'PortScan',
    severity: 'HIGH',
    flowSample: {
      destinationPort: 445,
      flowDuration: 1350,
      totalFwdPackets: 2,
      totalBwdPackets: 0,
      totalLengthFwdPackets: 0,
      totalLengthBwdPackets: 0,
      flowBytesPerSec: 0.0,
      flowPacketsPerSec: 1481.4,
      flowIatMean: 1350.0,
      synFlagCount: 2,
      ackFlagCount: 0,
      finFlagCount: 0,
      averagePacketSize: 0
    }
  },
  {
    id: 'case-ddos-synflood',
    name: 'Volumetric TCP SYN Flood (LOIC Profile)',
    category: 'DoS',
    mitreTechnique: 'T1498.001 - Direct Network Flood',
    description: 'Rapid bursts of hundreds of SYN packets per second to port 80/443 without ACK responses, overwhelming the OS TCP half-open connection backlog.',
    expectedClassification: 'DDoS LOIC (SYN Flood)',
    severity: 'CRITICAL',
    flowSample: {
      destinationPort: 80,
      flowDuration: 24500,
      totalFwdPackets: 120,
      totalBwdPackets: 0,
      totalLengthFwdPackets: 0,
      totalLengthBwdPackets: 0,
      flowBytesPerSec: 0.0,
      flowPacketsPerSec: 4897.9,
      flowIatMean: 205.8,
      synFlagCount: 120,
      ackFlagCount: 0,
      finFlagCount: 0,
      averagePacketSize: 0
    }
  },
  {
    id: 'case-ssh-bruteforce',
    name: 'SSH Automated Credential Guessing (Patator)',
    category: 'BruteForce',
    mitreTechnique: 'T1110.001 - Password Guessing',
    description: 'Rapid cyclical authentication sessions targeting SSH daemon port 22 with high PSH/ACK exchanges and small consistent cipher negotiation packet sizes.',
    expectedClassification: 'SSH-Patator',
    severity: 'HIGH',
    flowSample: {
      destinationPort: 22,
      flowDuration: 450000,
      totalFwdPackets: 28,
      totalBwdPackets: 32,
      totalLengthFwdPackets: 1890,
      totalLengthBwdPackets: 2450,
      flowBytesPerSec: 9644.4,
      flowPacketsPerSec: 133.3,
      flowIatMean: 7627.1,
      synFlagCount: 2,
      ackFlagCount: 58,
      finFlagCount: 1,
      averagePacketSize: 72.3
    }
  },
  {
    id: 'case-data-exfiltration',
    name: 'Anomalous Outbound Data Exfiltration',
    category: 'Exfiltration',
    mitreTechnique: 'T1048 - Exfiltration Over Alternative Protocol',
    description: 'Massive outbound single-session payload (>340 KB) directed towards an unassigned high port (4444) without legitimate TLS handshakes.',
    expectedClassification: 'Anomaly: Outbound Exfiltration',
    severity: 'HIGH',
    flowSample: {
      destinationPort: 4444,
      flowDuration: 890000,
      totalFwdPackets: 45,
      totalBwdPackets: 38,
      totalLengthFwdPackets: 345000,
      totalLengthBwdPackets: 1200,
      flowBytesPerSec: 389011.2,
      flowPacketsPerSec: 93.2,
      flowIatMean: 10853.6,
      synFlagCount: 1,
      ackFlagCount: 82,
      finFlagCount: 0,
      averagePacketSize: 4171.0
    }
  },
  {
    id: 'case-benign-https',
    name: 'Normal TLS 1.3 / HTTPS Web Browsing Session',
    category: 'Benign',
    mitreTechnique: 'N/A - Legitimate Baseline',
    description: 'Standard client-server TLS handshake on port 443 with balanced forward and backward packet exchange and normal inter-arrival times.',
    expectedClassification: 'BENIGN',
    severity: 'LOW',
    flowSample: {
      destinationPort: 443,
      flowDuration: 124800,
      totalFwdPackets: 8,
      totalBwdPackets: 7,
      totalLengthFwdPackets: 420,
      totalLengthBwdPackets: 1850,
      flowBytesPerSec: 18189.1,
      flowPacketsPerSec: 120.1,
      flowIatMean: 8914.2,
      synFlagCount: 1,
      ackFlagCount: 14,
      finFlagCount: 0,
      averagePacketSize: 151.3
    }
  }
];
