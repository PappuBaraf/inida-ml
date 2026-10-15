# INIDA-ML: Intelligent Network Intrusion Detection and Anomaly Analysis System

**Platform:** Network Intrusion Detection & Threat Analysis Platform  
**Benchmark Dataset:** CIC-IDS2017 (Canadian Institute for Cybersecurity, University of New Brunswick)  
**Architecture:** Random Forest Ensemble + Heuristic Lexical Threat Analysis + AI Incident Advisory  

---

## 1. Project Overview & Capabilities

Modern computer networks face sophisticated threats spanning volumetric DDoS attacks, subtle low-and-slow socket starvation (Slowloris), automated credential brute-forcing, multi-vector port scanning reconnaissance, and deceptive phishing URLs. 

**INIDA-ML** is engineered to:
1. **Ingest and Validate Tabular Flow Features:** Parse network flow telemetry extracted with CICFlowMeter conforming to the 77-feature CIC-IDS2017 schema.
2. **Perform Flow Inspection & Anomaly Scoring:** Evaluate continuous metrics (Flow Duration, Flow Bytes/s, Flow Packets/s) and discrete protocol flags (SYN, FIN, ACK, RST, PSH).
3. **URL & Website Threat Detection:** Paste any website URL or IP link to detect phishing traps, credential harvesting indicators, high-abuse TLDs, and C2 servers.
4. **Machine Learning Methods & Feature Specification:** Full documentation of the 77 extracted features, feature importance ranks, and custom dataset schema upload validation.
5. **Localhost Security Simulation:** Inspect real attack signatures in a controlled sandbox without external packet transmission.
6. **AI-Assisted Incident Advisory:** Consult an integrated AI Security Analyst for MITRE ATT&CK mapping, threat explanation, and defense rules (Suricata / iptables / Snort).

---

## 2. Dataset Documentation & Audit

### Official Dataset Sources
- **Official UNB Portal:** [https://www.unb.ca/cic/datasets/ids-2017.html](https://www.unb.ca/cic/datasets/ids-2017.html)
- **Kaggle Mirror (Parquet):** [https://www.kaggle.com/dsv/4059877](https://www.kaggle.com/dsv/4059877)

### Audit of `Benign-Monday-no-metadata.parquet`
The baseline file `Benign-Monday-no-metadata.parquet` contains **458,831 records** and 77 flow features. A systematic audit confirms:
- **100% of records are labeled `BENIGN`** (0 malicious observations).
- A supervised binary or multi-class classifier cannot be trained on Monday data alone. Training on a single class causes decision boundary collapse and produces a trivial classifier with 0% attack recall.
- **Model Status:** Truthfully displayed across the UI as `"Model not trained — attack data required."`
- Real training requires incorporating Wednesday (DoS/Heartbleed), Thursday (Web Attacks), and Friday (DDoS/PortScan) captures.

---

## 3. Machine Learning Pipeline Architecture

The complete, reproducible training script is located in `scripts/train_random_forest.py`.

### Architecture Specifications:
- **Algorithm:** Random Forest Classifier (100 Estimators, Gini Impurity, Max Depth 25)
- **Scaling:** `StandardScaler` on continuous flow metrics
- **Class Balancing:** `class_weight='balanced_subsample'`
- **Target Attack Classes (11 Classes):**
  - BENIGN
  - DoS Slowloris
  - DoS Slowhttptest
  - DoS Hulk
  - DoS GoldenEye
  - DDoS LOIC
  - PortScan
  - FTP-Patator
  - SSH-Patator
  - Botnet ARES
  - Infiltration

### Training Execution Command:
```bash
# 1. Install ML dependencies
pip install pandas numpy scikit-learn joblib pyarrow fastparquet

# 2. Run training script
python scripts/train_random_forest.py --data-path data/cic_ids_multiday.parquet --output-dir models/
```

**Artifacts Produced:**
- `models/intrusion_pipeline.joblib`: Serialized Scaler & Random Forest model.
- `models/model_metadata.json`: Feature definitions, hyperparameters, and schema mapping.
- `models/evaluation_metrics.json`: Classification report, precision, recall, and F1 scores.

---

## 4. Quickstart & Installation Instructions

### Windows (PowerShell / Command Prompt)
```powershell
# 1. Clone or extract the project repository
cd inida-ml

# 2. Copy the environment template
copy .env.example .env

# 3. Install dependencies
npm install

# 4. Launch the local development server
npm run dev

# 5. Open your browser at http://localhost:3000
```

### Linux / macOS
```bash
# 1. Setup environment
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Launch application
npm run dev
```

### Automated Verification Tests
```bash
npx tsx tests/run_tests.ts
```
