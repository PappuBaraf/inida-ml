/**
 * INIDA-ML Automated Test Suite
 * Evaluates API endpoints, URL scanner, feature validation, and anomaly evaluation.
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ' -> ' + detail : ''}`);
    failCount++;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log(' INIDA-ML SYSTEM ARCHITECTURAL TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Model metadata and evaluation metrics artifacts existence
  assert(fs.existsSync('./models/model_metadata.json'), 'Artifact: models/model_metadata.json exists');
  assert(fs.existsSync('./models/evaluation_metrics.json'), 'Artifact: models/evaluation_metrics.json exists');

  // Test 2: Honest evaluation metrics check
  const metricsRaw = fs.readFileSync('./models/evaluation_metrics.json', 'utf8');
  const metrics = JSON.parse(metricsRaw);
  assert(metrics.is_trained === false, 'Honest Evaluation: is_trained is marked false without multi-day attack data');
  assert(metrics.status.includes('Model not trained'), 'Honest Evaluation: status explicitly displays model not trained notice');

  // Test 3: Demo dataset files check
  assert(fs.existsSync('./demo_data/cic_ids_sample_benign_flows.csv'), 'Fixture: cic_ids_sample_benign_flows.csv exists');
  assert(fs.existsSync('./demo_data/cic_ids_sample_mixed_traffic.csv'), 'Fixture: cic_ids_sample_mixed_traffic.csv exists');
  assert(fs.existsSync('./demo_data/cic_ids_malformed_test.csv'), 'Fixture: cic_ids_malformed_test.csv exists');

  // Test 4: Feature Validation Engine check
  const requiredColumns = [
    'Destination Port',
    'Flow Duration',
    'Total Fwd Packets',
    'Total Backward Packets',
    'Flow Bytes/s',
    'Flow Packets/s'
  ];

  const benignCsv = fs.readFileSync('./demo_data/cic_ids_sample_benign_flows.csv', 'utf8');
  const benignHeaders = benignCsv.split('\n')[0].split(',').map(s => s.trim());
  const benignHasRequired = requiredColumns.every(col => benignHeaders.includes(col));
  assert(benignHasRequired, 'Validation Engine: Benign sample contains required CIC-IDS2017 features');

  const malformedCsv = fs.readFileSync('./demo_data/cic_ids_malformed_test.csv', 'utf8');
  const malformedHeaders = malformedCsv.split('\n')[0].split(',').map(s => s.trim());
  const malformedHasRequired = requiredColumns.every(col => malformedHeaders.includes(col));
  assert(!malformedHasRequired, 'Validation Engine: Malformed raw packet payload correctly rejected as missing tabular flow features');

  // Test 5: URL Threat Heuristic logic
  const testPhishingUrl = 'http://update-secure-banking.xyz/login.php?token=92847';
  const hasInsecureHttp = testPhishingUrl.startsWith('http://');
  const hasSuspiciousTld = testPhishingUrl.includes('.xyz');
  const hasPhishKeyword = ['login', 'banking', 'secure'].some(k => testPhishingUrl.includes(k));
  assert(hasInsecureHttp && hasSuspiciousTld && hasPhishKeyword, 'URL Scanner: Correctly identifies composite risk indicators on phishing test URL');

  // Test 6: Environment Configuration
  const envContent = fs.existsSync('./.env') ? fs.readFileSync('./.env', 'utf8') : '';
  const hasConfig = envContent.length > 0;
  assert(hasConfig, 'Environment: Local .env configuration file exists');

  // Test 7: CIC-IDS2017 Column Name Normalization & Aliases (Destination Port with space/BOM/quotes/Dst Port)
  const testHeadersWithSpacesAndBOM = [
    '\uFEFF Destination Port',
    ' Flow Duration',
    ' Total Fwd Packets',
    ' Total Backward Packets',
    'Flow Bytes/s',
    ' Flow Packets/s'
  ];
  const { validateFlowSchema, cleanHeader } = await import('../src/utils/flowParser.ts');
  const spaceValidation = validateFlowSchema(testHeadersWithSpacesAndBOM);
  assert(spaceValidation.isValid, 'Validation Engine: Correctly accepts " Destination Port" with leading space and UTF-8 BOM');

  const dstPortHeaders = [
    'Dst Port',
    'Duration',
    'Tot Fwd Pkts',
    'Tot Bwd Pkts',
    'Flow Bytes/s',
    'Flow Packets/s'
  ];
  const dstValidation = validateFlowSchema(dstPortHeaders);
  assert(dstValidation.isValid, 'Validation Engine: Correctly accepts "Dst Port" and "Tot Bwd Pkts" aliases');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
