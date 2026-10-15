#!/usr/bin/env python3
"""
INIDA-ML: Dataset Schema & Label Distribution Validator
"""

import sys
import os

def validate(file_path):
    print(f"[*] Validating dataset: {file_path}")
    if not os.path.exists(file_path):
        print(f"[!] Target file does not exist locally: {file_path}")
        print("    If you have Benign-Monday-no-metadata.parquet, place it in the project root.")
        return

    try:
        import pandas as pd
    except ImportError:
        print("[!] pandas is not installed in the current environment.")
        return

    if file_path.endswith('.parquet'):
        df = pd.read_parquet(file_path)
    else:
        df = pd.read_csv(file_path)

    df.columns = df.columns.str.strip()
    print(f"[+] Total Records: {len(df):,}")
    print(f"[+] Total Features: {len(df.columns)}")
    if 'Label' in df.columns:
        print("[+] Unique Labels:")
        for label, count in df['Label'].value_counts().items():
            print(f"    - '{label}': {count:,}")
        if len(df['Label'].unique()) == 1 and df['Label'].unique()[0] == 'BENIGN':
            print("\n[AUDIT NOTE]:")
            print("This file contains strictly BENIGN baseline flows.")
            print("Per INIDA-ML academic guidelines, binary classifiers cannot be trained on this alone.")
    else:
        print("[!] 'Label' column not detected.")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'Benign-Monday-no-metadata.parquet'
    validate(target)
