module.exports = {
  apps: [
    {
      name: 'websocket-service',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8001',
      // Use venv Python interpreter - update path to match your EC2 setup
      interpreter: '/home/ec2-user/sakura-websocket-service/venv/bin/python',
      // Alternative: if venv is in parent directory or different location
      // interpreter: '/home/ec2-user/venv/bin/python',
      cwd: '/home/ec2-user/sakura-websocket-service',
      env: {
        WS_SERVICE_HOST: '0.0.0.0',
        WS_SERVICE_PORT: '8001',
        WS_REDIS_URL: 'redis://localhost:6379/0',
        WS_ALLOWED_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000',
        WS_MONGO_URI: 'mongodb+srv://paulemechebeco_db_user:dbuser@sakura-cluster.wcmr0rf.mongodb.net/?retryWrites=true&w=majority&appName=sakura-cluster',
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

