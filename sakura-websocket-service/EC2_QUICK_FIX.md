# Quick Fix Commands for EC2

## Copy and paste these commands on your EC2 instance:

```bash
# 1. Stop and remove the broken PM2 process
pm2 stop websocket-service
pm2 delete websocket-service

# 2. Navigate to your websocket service directory
cd sakura-websocket-service  # Adjust path if different

# 3. Find your venv Python path (IMPORTANT!)
source venv/bin/activate
VENV_PYTHON=$(which python)
echo "Your venv Python is at: $VENV_PYTHON"
deactivate

# 4. Update ecosystem.config.js with your actual paths
# Edit the file and update these two lines:
#   interpreter: '/home/ec2-user/sakura-websocket-service/venv/bin/python'
#   cwd: '/home/ec2-user/sakura-websocket-service'
# Use the $VENV_PYTHON path from step 3 for the interpreter

# 5. Make sure .env file exists (create if needed)
cat > .env << 'EOF'
WS_SERVICE_HOST=0.0.0.0
WS_SERVICE_PORT=8001
WS_REDIS_URL=redis://localhost:6379/0
WS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
WS_MONGO_URI=mongodb://localhost:27017
WS_MONGO_DB=sakura
WS_CHAT_SNAPSHOT_INTERVAL=2
WS_UNREAD_SNAPSHOT_INTERVAL=5
EOF

# 6. Start with PM2
pm2 start ecosystem.config.js

# 7. Check status
pm2 status

# 8. Check logs (should see "🚀 Starting WebSocket microservice")
pm2 logs websocket-service --lines 20

# 9. Test health endpoint
curl http://localhost:8001/health

# 10. Save PM2 config
pm2 save
```

## Expected Output

After step 9, you should see:
```json
{"status":"ok","mongo":"healthy","redis":"connected"}
```

After step 8, you should see logs like:
```
🚀 Starting WebSocket microservice
🔗 Connecting to Redis at redis://localhost:6379/0
📡 Subscribed to Redis channels: chat_updates, unread_counts, website_status
```

## If it still doesn't work:

1. **Check the interpreter path is correct:**
   ```bash
   ls -la /home/ec2-user/sakura-websocket-service/venv/bin/python
   # Should exist and be executable
   ```

2. **Verify uvicorn is installed in venv:**
   ```bash
   source venv/bin/activate
   which uvicorn
   pip list | grep uvicorn
   ```

3. **Try manual start to see full error:**
   ```bash
   source venv/bin/activate
   uvicorn app.main:app --host 0.0.0.0 --port 8001
   # This will show you any import errors
   ```

