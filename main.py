# This file redirects to the backend main.py for Render.com deployment
import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Import and run the backend application
if __name__ == "__main__":
    from main import app
    import uvicorn
    import os
    
    # Get port from environment variable (Render.com sets this)
    port = int(os.environ.get("PORT", 8000))
    
    # Check if we're in production (Render.com sets RENDER=true)
    is_production = os.environ.get("RENDER") == "true"
    
    print("🌟 Starting FastAPI server...")
    print(f"🌐 Port: {port}")
    print(f"🏭 Production mode: {is_production}")
    
    if is_production:
        # Production mode - no reload
        uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
    else:
        # Development mode - with reload
        uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
