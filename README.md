# INIDA-ML: Intelligent Network Intrusion Detection & Threat Analysis System

<p align="center">
  <b>Advanced Network-Flow Threat Analysis, Supervised Machine Learning & AI Incident Advisory</b><br>
  <img src="https://img.shields.io/badge/Platform-Streamlit%20%7C%20Python-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/Dataset-CIC--IDS2017-orange?style=flat-square" alt="Dataset">
  <img src="https://img.shields.io/badge/Model-Random%20Forest%20Ensemble-green?style=flat-square" alt="Model">
</p>

---

## 📌 Project Overview & Capabilities
**INIDA-ML** is an academic platform designed to inspect tabular network flow characteristics, evaluate volumetric floods, detect malicious website links, and probe live ports for vulnerable service exposures.

1. **Tabular Flow Ingestion:** Parses and validates network flow logs against the 77-feature CIC-IDS2017 schema.
2. **Random Forest Ensemble:** Employs a Random Forest classifier ($100$ estimators, $\text{max\_depth}=25$, balanced class weights) with continuous feature scaling via `StandardScaler`.
3. **URL Threat Scanner:** Identifies phishing traps, high-abuse TLDs, raw IP hosts, and credential harvesting keywords.
4. **Live Port Prober:** Audits 17 essential attack sockets and services (Telnet, SMB, RDP) for vulnerability risks and latencies.
5. **AI Security Analyst:** Integrates a dual-engine incident response assistant (Gemini/Groq) to map threats to MITRE ATT&CK and generate defense rules.

---

## 📊 Dataset Benchmark & Audit
* **Primary Source:** CIC-IDS2017 Dataset ([UNB Portal](https://www.unb.ca/cic/datasets/ids-2017.html) | [Kaggle Mirror](https://www.kaggle.com/dsv/4059877))
* **Monday Benign File Audit (`Benign-Monday-no-metadata.parquet`):** Contains **458,831 records** strictly labeled as `BENIGN`. 
* **Academic Transparency:** Binary supervised metrics are transparently flagged as `"Model not trained — attack data required"` to prevent decision boundary collapse. Multi-day captures (Wednesday–Friday) are required for full multi-class training.

---

## ⚙️ Machine Learning Pipeline
* **Training Command:**
  ```bash
  pip install pandas numpy scikit-learn joblib pyarrow fastparquet
  python scripts/train_random_forest.py --data-path data/cic_ids_multiday.parquet --output-dir models/

  # 1. Clone repository & enter directory
git clone [https://github.com/PappuBaraf/inida-ml.git](https://github.com/PappuBaraf/inida-ml.git)
cd inida-ml

# 2. Configure environment & install dependencies
cp .env.example .env
pip install -r requirements.txt
npm install

# 3. Launch application
npm run dev
