# Quick Fix - Run These Commands on EC2

## Step-by-Step Fix

```bash
# 1. Navigate to websocket service directory
cd /home/ec2-user/sakura/sakura-websocket-service

# 2. Verify ecosystem.config.js exists
ls -la ecosystem.config.js

# 3. Check your actual venv Python path
source venv/bin/activate
which python
# Note the path - it should be something like:
# /home/ec2-user/sakura/sakura-websocket-service/venv/bin/python
deactivate

# 4. Update ecosystem.config.js with correct paths
nano ecosystem.config.js
# Update line 8 (interpreter) and line 11 (cwd) with your actual paths
# Press Ctrl+X, then Y, then Enter to save

# 5. Stop and DELETE the old PM2 process (important!)
pm2 stop websocket-service
pm2 delete websocket-service

# 6. Start with the NEW ecosystem.config.js
pm2 start ecosystem.config.js

# 7. Check status
pm2 status

# 8. Check logs (should see startup messages, not errors)
pm2 logs websocket-service --lines 30

# 9. Test health endpoint
curl http://localhost:8001/health

# 10. Save PM2 config
pm2 save
```

## Expected Output After Fix

After step 8, you should see:
```
🚀 Starting WebSocket microservice
🔗 Connecting to Redis at redis://localhost:6379/0
📡 Subscribed to Redis channels: chat_updates, unread_counts, website_status
```

After step 9, you should see:
```json
{"status":"ok","mongo":"healthy","redis":"connected"}
```

## If You See Path Errors

If the interpreter path is wrong, update it in `ecosystem.config.js`:

```bash
# Find your actual Python path
source venv/bin/activate
which python
# Copy the full path

# Edit ecosystem.config.js
nano ecosystem.config.js
# Update the interpreter line with the path you found
```

## Common Issues

### Issue: "Cannot find module 'uvicorn'"
**Fix:** Make sure the `interpreter` path points to your venv's Python:
```bash
# Check if uvicorn is in venv
source venv/bin/activate
which uvicorn
pip list | grep uvicorn
```

### Issue: "Could not import module 'app.main'"
**Fix:** Check the `cwd` path is correct:
```bash
# Verify you're in the right directory
pwd
# Should be: /home/ec2-user/sakura/sakura-websocket-service

# Check app/main.py exists
ls -la app/main.py
```

### Issue: Still seeing old errors after restart
**Fix:** Make sure you DELETED the old process:
```bash
pm2 delete websocket-service  # This removes it completely
pm2 start ecosystem.config.js  # Then start fresh
```

