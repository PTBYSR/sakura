# PM2 Setup for WebSocket Service on EC2

## The Problem
PM2 was trying to import `app.websocket_server` which doesn't exist. The correct module is `app.main:app`.

## Complete Fix - Step by Step

### Step 1: Stop and remove the broken PM2 process
```bash
pm2 stop websocket-service
pm2 delete websocket-service
```

### Step 2: Navigate to your websocket service directory
```bash
cd /path/to/sakura-websocket-service  # Update with your actual path
```

### Step 3: Update ecosystem.config.js
1. Make sure `ecosystem.config.js` is in the directory
2. **Update the interpreter path** to point to your virtual environment's Python:
   ```bash
   # Find your venv Python path
   which python  # After activating venv
   # Or check:
   ls -la venv/bin/python
   ```

3. **Update the `cwd` path** in `ecosystem.config.js` to match your actual directory:
   ```javascript
   interpreter: '/home/ec2-user/sakura-websocket-service/venv/bin/python',  // Update this
   cwd: '/home/ec2-user/sakura-websocket-service',  // Update this
   ```

### Step 4: Verify virtual environment
```bash
# Activate venv and check Python path
source venv/bin/activate
which python
which uvicorn
# Note the paths for ecosystem.config.js
deactivate
```

### Step 5: Create/Update .env file
```bash
# Create .env if it doesn't exist
cat > .env << EOF
WS_SERVICE_HOST=0.0.0.0
WS_SERVICE_PORT=8001
WS_REDIS_URL=redis://localhost:6379/0
WS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
WS_MONGO_URI=mongodb://localhost:27017
WS_MONGO_DB=sakura
WS_CHAT_SNAPSHOT_INTERVAL=2
WS_UNREAD_SNAPSHOT_INTERVAL=5
EOF
```

**Important:** Update `WS_REDIS_URL` and `WS_MONGO_URI` with your actual Redis and MongoDB connection strings if they're different.

### Step 6: Start with PM2 using ecosystem config
```bash
pm2 start ecosystem.config.js
```

### Step 7: Save PM2 configuration
```bash
pm2 save
pm2 startup  # Follow the instructions to enable auto-start on reboot
```

### Step 8: Verify it's working
```bash
# Check status
pm2 status

# Check logs (should see startup messages)
pm2 logs websocket-service --lines 50

# Test the health endpoint
curl http://localhost:8001/health

# Expected response:
# {"status":"ok","mongo":"healthy","redis":"connected"}
```

## Alternative: Manual PM2 Start (if ecosystem.config.js doesn't work)

If you prefer to start manually with the venv:

```bash
cd sakura-websocket-service
source venv/bin/activate

# Start with PM2
pm2 start uvicorn --name websocket-service --interpreter venv/bin/python -- \
  app.main:app --host 0.0.0.0 --port 8001

pm2 save
```

## Alternative: Use the startup script

```bash
chmod +x start.sh
./start.sh  # Runs directly (not with PM2)
```

## Troubleshooting

### If you see "ModuleNotFoundError"
- Make sure the `interpreter` path in `ecosystem.config.js` points to your venv's Python
- Verify dependencies are installed: `source venv/bin/activate && pip list | grep uvicorn`

### If you see "Could not import module"
- Verify you're in the correct directory
- Check that `app/main.py` exists
- The module path should be `app.main:app` (not `app.websocket_server`)

### If Redis/MongoDB connection fails
- Check that Redis is running: `redis-cli ping` (should return PONG)
- Check MongoDB connection: Update `WS_MONGO_URI` in `.env` if needed
- The service will still start but with limited functionality

### Check PM2 logs
```bash
pm2 logs websocket-service --err  # Error logs only
pm2 logs websocket-service --out  # Output logs only
pm2 logs websocket-service --lines 100  # Last 100 lines
```

## Environment Variables Reference

The service reads from `.env` file or environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_SERVICE_HOST` | `0.0.0.0` | Host to bind to |
| `WS_SERVICE_PORT` | `8001` | Port to listen on |
| `WS_REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL |
| `WS_ALLOWED_ORIGINS` | `http://localhost:3000,...` | CORS allowed origins (comma-separated) |
| `WS_MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection URI |
| `WS_MONGO_DB` | `sakura` | MongoDB database name |
| `WS_CHAT_SNAPSHOT_INTERVAL` | `2` | Chat snapshot interval (seconds) |
| `WS_UNREAD_SNAPSHOT_INTERVAL` | `5` | Unread count snapshot interval (seconds) |

