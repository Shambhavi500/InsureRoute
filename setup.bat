@echo off
echo ==============================================
echo  InsureRoute - Setup Script
echo ==============================================

:: Create data directory and move CSV if not already there
if not exist "data" mkdir data
if exist "SmartSupplyChain_Dataset_30000.csv" (
    if not exist "data\SmartSupplyChain_Dataset_30000.csv" (
        copy "SmartSupplyChain_Dataset_30000.csv" "data\"
        echo [OK] CSV moved to data\
    ) else (
        echo [OK] CSV already in data\
    )
) else (
    echo [WARN] SmartSupplyChain_Dataset_30000.csv not found in current directory.
    echo        Make sure it is in data\ subfolder.
)

:: Create frontend directory
if not exist "frontend" mkdir frontend

:: Create virtual environment
echo.
echo [1/3] Creating virtual environment...
python -m venv venv

:: Activate and install
echo [2/3] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo [3/3] Setup complete!
echo.
echo =============================================
echo  To run the dashboard:
echo    venv\Scripts\activate
echo    streamlit run frontend\dashboard.py
echo =============================================
pause
