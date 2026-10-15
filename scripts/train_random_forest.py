#!/usr/bin/env python3
"""
INIDA-ML: Intelligent Network Intrusion Detection and Anomaly Analysis
Script: Real Random Forest Training Pipeline for CIC-IDS2017 Dataset

Usage:
    python scripts/train_random_forest.py --data-path path/to/dataset.parquet --output-dir models/
"""

import os
import sys
import argparse
import json
from datetime import datetime

def check_dependencies():
    missing = []
    for pkg in ['pandas', 'numpy', 'sklearn', 'joblib']:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"[ERROR] Missing required Python packages: {', '.join(missing)}")
        print("Please install them using: pip install " + " ".join(missing) + " pyarrow")
        return False
    return True

def train_pipeline(data_path: str, output_dir: str):
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    import joblib

    print("=================================================================")
    print(" INIDA-ML Random Forest Training Pipeline (CIC-IDS2017)")
    print("=================================================================")

    if not os.path.exists(data_path):
        print(f"[ERROR] Input file not found: {data_path}")
        sys.exit(1)

    print(f"[*] Loading dataset: {data_path}")
    if data_path.endswith('.parquet'):
        df = pd.read_parquet(data_path)
    elif data_path.endswith('.csv'):
        df = pd.read_csv(data_path)
    else:
        print("[ERROR] Unsupported format. Please provide .parquet or .csv")
        sys.exit(1)

    print(f"[*] Total records loaded: {len(df):,}")
    print(f"[*] Columns detected: {len(df.columns)}")

    # Clean column names (strip whitespace)
    df.columns = df.columns.str.strip()

    if 'Label' not in df.columns:
        print("[ERROR] Missing required 'Label' column.")
        sys.exit(1)

    # Inspect class balance
    label_counts = df['Label'].value_counts()
    print("\n[*] Dataset Class Distribution:")
    for label, count in label_counts.items():
        print(f"    - {label}: {count:,} ({count/len(df)*100:.2f}%)")

    # Safety check: Prevent training single-class model
    unique_labels = df['Label'].unique()
    if len(unique_labels) < 2:
        print("\n[CRITICAL SAFETY HALT] Model cannot be trained!")
        print("The provided dataset contains only one label class:")
        print(f"Labels found: {list(unique_labels)}")
        print("A classifier trained on solely Benign data cannot differentiate attacks.")
        print("Please supply a combined multi-day CIC-IDS2017 dataset containing confirmed attacks.")
        sys.exit(2)

    # Data Cleaning: Handle infinities and NaNs
    print("\n[*] Preprocessing and cleaning flow features...")
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'Label' in numeric_cols:
        numeric_cols.remove('Label')

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(subset=numeric_cols, inplace=True)

    X = df[numeric_cols]
    y = df['Label']

    # Train / Test split
    print("[*] Splitting dataset (80% train, 20% test, stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Standard Scaler
    print("[*] Fitting StandardScaler on continuous flow dimensions...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Random Forest Classifier
    print("[*] Training RandomForestClassifier (100 estimators, max_depth=25)...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=25,
        n_jobs=-1,
        random_state=42,
        class_weight='balanced_subsample'
    )
    rf.fit(X_train_scaled, y_train)

    print("[*] Evaluating on held-out test split...")
    y_pred = rf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    print(f"\n[SUCCESS] Test Accuracy: {acc*100:.2f}%")

    os.makedirs(output_dir, exist_ok=True)
    pipeline_artifact = {
        'model': rf,
        'scaler': scaler,
        'feature_names': numeric_cols,
        'classes': rf.classes_.tolist()
    }
    model_path = os.path.join(output_dir, "intrusion_pipeline.joblib")
    joblib.dump(pipeline_artifact, model_path)
    print(f"[*] Saved model pipeline artifact: {model_path}")

    # Save evaluation metrics
    metrics_path = os.path.join(output_dir, "evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "project_title": "INIDA-ML: Intelligent Network Intrusion Detection and Anomaly Analysis System",
            "status": "TRAINED_VERIFIED",
            "is_trained": True,
            "trained_at": datetime.utcnow().isoformat(),
            "accuracy": acc,
            "classification_report": report
        }, f, indent=2)
    print(f"[*] Saved evaluation metrics: {metrics_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="INIDA-ML Random Forest Trainer")
    parser.add_argument("--data-path", type=str, default="Benign-Monday-no-metadata.parquet", help="Path to input Parquet or CSV")
    parser.add_argument("--output-dir", type=str, default="models", help="Directory to save artifacts")
    args = parser.parse_args()

    if check_dependencies():
        train_pipeline(args.data_path, args.output_dir)
