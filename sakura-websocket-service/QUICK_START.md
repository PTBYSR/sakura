# Quick Start Guide - WebSocket Service

## Step 1: Start Redis

### Option A: Start Docker Desktop (Easiest)
1. Open **Docker Desktop** from Start Menu
2. Wait for it to start (check system tray)
3. Run:
   ```powershell
   docker run --name sakura-redis -p 6379:6379 redis:7-alpine
   ```

### Option B: Use WSL (If you have it)
```bash
# In WSL terminal
sudo service redis-server start
```

### Option C: Skip Redis for now
The service will work but without real-time updates. Only snapshots will work.

---

## Step 2: Create Environment File

Create `sakura-websocket-service/.env`:

```env
WS_SERVICE_HOST=0.0.0.0
WS_SERVICE_PORT=8001
WS_REDIS_URL=redis://localhost:6379/0
WS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
WS_MONGO_URI=mongodb://localhost:27017
WS_MONGO_DB=sakura
WS_CHAT_SNAPSHOT_INTERVAL=2
WS_UNREAD_SNAPSHOT_INTERVAL=5
```

---

## Step 3: Install Dependencies

```powershell
cd sakura-websocket-service
pip install -r requirements.txt
```

---

## Step 4: Start the Service

```powershell
cd sakura-websocket-service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Step 5: Verify

1. Check health: http://localhost:8001/health
2. Look for logs:
   - `🚀 Starting WebSocket microservice`
   - `🔗 Connecting to Redis at...`
   - `📡 Subscribed to Redis channels...`

---

## Troubleshooting

- **Redis connection failed?** The service will still start but log warnings. Real-time updates won't work.
- **MongoDB not connected?** Snapshots will be disabled, but Redis updates will still work.
- **Port 8001 in use?** Change `WS_SERVICE_PORT` in `.env`

