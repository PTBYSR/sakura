# Create ecosystem.config.js on EC2

## Quick Fix - Copy and Paste This on EC2

Run these commands on your EC2 instance:

```bash
cd /home/ec2-user/sakura/sakura-websocket-service

# Create the ecosystem.config.js file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'websocket-service',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8001',
      // Use venv Python interpreter - update path to match your EC2 setup
      interpreter: '/home/ec2-user/sakura/sakura-websocket-service/venv/bin/python',
      // Alternative: if venv is in parent directory or different location
      // interpreter: '/home/ec2-user/venv/bin/python',
      cwd: '/home/ec2-user/sakura/sakura-websocket-service',
      env: {
        WS_SERVICE_HOST: '0.0.0.0',
        WS_SERVICE_PORT: '8001',
        WS_REDIS_URL: 'redis://localhost:6379/0',
        WS_ALLOWED_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000',
        WS_MONGO_URI: 'mongodb://localhost:27017',
        WS_MONGO_DB: 'sakura',
        WS_CHAT_SNAPSHOT_INTERVAL: '2',
        WS_UNREAD_SNAPSHOT_INTERVAL: '5',
      },
      error_file: '/home/ec2-user/.pm2/logs/websocket-service-error.log',
      out_file: '/home/ec2-user/.pm2/logs/websocket-service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
EOF

# Verify the file was created
ls -la ecosystem.config.js

# Check your actual Python path
source venv/bin/activate
ACTUAL_PYTHON=$(which python)
echo "Your Python path is: $ACTUAL_PYTHON"
deactivate

# Update the interpreter path in ecosystem.config.js if needed
# (The path above assumes /home/ec2-user/sakura/sakura-websocket-service/venv/bin/python)
# If your path is different, edit it:
# nano ecosystem.config.js
# Update line 8 with: interpreter: '$ACTUAL_PYTHON',

# Now stop and delete old PM2 process
pm2 stop websocket-service
pm2 delete websocket-service

# Start with the new config
pm2 start ecosystem.config.js

# Check status
pm2 status

# Check logs
pm2 logs websocket-service --lines 30

# Test
curl http://localhost:8001/health

# Save
pm2 save
```

## Note About Paths

The default paths in the file assume:
- Repository is at: `/home/ec2-user/sakura/`
- WebSocket service is at: `/home/ec2-user/sakura/sakura-websocket-service/`
- Venv is at: `/home/ec2-user/sakura/sakura-websocket-service/venv/`

If your paths are different, update the `interpreter` and `cwd` lines in `ecosystem.config.js`.

