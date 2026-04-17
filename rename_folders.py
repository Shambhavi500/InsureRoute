import os
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
OLD_FRONTEND = os.path.join(ROOT, "frontend")
NEW_FRONTEND = os.path.join(ROOT, "react-frontend")

if os.path.exists(OLD_FRONTEND):
    print("Deleting old Streamlit frontend...")
    shutil.rmtree(OLD_FRONTEND)

if os.path.exists(NEW_FRONTEND):
    print("Renaming react-frontend to frontend...")
    os.rename(NEW_FRONTEND, os.path.join(ROOT, "frontend"))
    print("Success! Folders reorganized.")
else:
    print("react-frontend folder not found. It might have already been renamed.")
