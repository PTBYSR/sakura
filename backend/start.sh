#!/bin/bash

# Production startup script for Render.com
echo "🚀 Starting Sakura Backend on Render.com..."

# Set environment variables for production
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export PYTHONUNBUFFERED=1

# Start the application with gunicorn for production
echo "🌟 Starting FastAPI server with Gunicorn..."
gunicorn main:app \
    --bind 0.0.0.0:$PORT \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --access-logfile - \
    --error-logfile -
