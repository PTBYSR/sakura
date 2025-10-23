@echo off
echo 🐍 Starting Sakura Backend...
echo ================================

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    echo Installing dependencies...
    venv\Scripts\activate && pip install -r requirements.txt
)

echo ✅ Activating virtual environment...
call venv\Scripts\activate

echo ✅ Starting FastAPI server...
echo 🌐 Backend will be available at: http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo ================================
echo 💡 Press Ctrl+C to stop the server

uvicorn main:app --reload --host 0.0.0.0 --port 8000
