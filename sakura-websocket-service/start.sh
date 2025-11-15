#!/bin/bash
# Startup script for WebSocket service on EC2
# This script can be used to start the service manually or with PM2

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
elif [ -d "../venv" ]; then
    echo "✅ Activating virtual environment from parent directory..."
    source ../venv/bin/activate
else
    echo "⚠️  No virtual environment found, using system Python"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from defaults..."
    cat > .env << EOF
WS_SERVICE_HOST=0.0.0.0
WS_SERVICE_PORT=8001
WS_REDIS_URL=redis://localhost:6379/0
WS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
WS_MONGO_URI=mongodb+srv://paulemechebeco_db_user:dbuser@sakura-cluster.wcmr0rf.mongodb.net/?retryWrites=true&w=majority&appName=sakura-cluster
WS_MONGO_DB=sakura
WS_CHAT_SNAPSHOT_INTERVAL=2
WS_UNREAD_SNAPSHOT_INTERVAL=5
EOF
    echo "✅ Created .env file. Please update with your actual values."
fi

# Start the service
echo "🚀 Starting WebSocket service..."
echo "📍 Service will be available at: http://0.0.0.0:8001"
echo "🔍 Health check: http://localhost:8001/health"
echo ""

uvicorn app.main:app --host 0.0.0.0 --port 8001

