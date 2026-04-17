#!/usr/bin/env python3
"""
move_csv.py — Run once to organize the data directory.
Usage: python move_csv.py
"""

import os
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "SmartSupplyChain_Dataset_30000.csv")
DATA_DIR = os.path.join(ROOT, "data")
DST = os.path.join(DATA_DIR, "SmartSupplyChain_Dataset_30000.csv")

os.makedirs(DATA_DIR, exist_ok=True)

if os.path.exists(DST):
    print(f"[OK] CSV already at: {DST}")
elif os.path.exists(SRC):
    shutil.copy2(SRC, DST)
    print(f"[OK] CSV moved to: {DST}")
else:
    print(f"[WARN] CSV not found at root or data/. Place it in: {DATA_DIR}")

# Also create frontend dir if missing
os.makedirs(os.path.join(ROOT, "frontend"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "backend"), exist_ok=True)

print("[OK] Project directories verified.")
print()
print("Next steps:")
print("  python -m venv venv")
print("  venv\\Scripts\\activate         # Windows")
print("  pip install -r requirements.txt")
print("  streamlit run frontend/dashboard.py")
