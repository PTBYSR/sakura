# Redis Setup Options for Windows

## Option 1: Docker Desktop (Recommended if you have it)

1. **Start Docker Desktop** from Start Menu
2. Wait for it to fully start (whale icon in system tray)
3. Run:
   ```powershell
   docker run --name sakura-redis -p 6379:6379 redis:7-alpine
   ```

## Option 2: WSL (Windows Subsystem for Linux)

If you have WSL installed:

```bash
# In WSL terminal
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start

# Verify
redis-cli ping
# Should return: PONG
```

## Option 3: Memurai (Windows Native Redis Alternative)

1. Download from: https://www.memurai.com/get-memurai
2. Install Memurai (it's Redis-compatible)
3. It will start automatically as a Windows service
4. Use connection: `redis://localhost:6379/0`

## Option 4: Cloud Redis (For Development)

You can use a free cloud Redis service:

- **Upstash Redis** (Free tier): https://upstash.com/
- **Redis Cloud** (Free tier): https://redis.com/try-free/

Update your `.env` files with the cloud Redis URL:
```
WS_REDIS_URL=redis://your-cloud-redis-url:6379/0
REDIS_URL=redis://your-cloud-redis-url:6379/0
```

## Option 5: Skip Redis (Limited Functionality)

⚠️ **Note**: Your WebSocket service will still work but won't receive real-time updates from the backend. Only periodic snapshots will work (if MongoDB is connected).

To run without Redis:
1. Start the WebSocket service anyway
2. It will log a warning but continue running
3. Real-time chat updates won't work, but snapshots will

## Quick Test

After starting Redis (any method), test the connection:

```powershell
# If you have redis-cli installed
redis-cli ping

# Or test from Python
python -c "import redis; r = redis.Redis.from_url('redis://localhost:6379/0'); print(r.ping())"
```

