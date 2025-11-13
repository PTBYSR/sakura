# Redis Setup for EC2 Instance

## Overview

Your **local Docker Redis** is only for local development. Your **EC2 instance** needs its own Redis instance. They are completely separate and won't interfere with each other.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  Local (Windows)│         │   EC2 Instance  │
│                 │         │                 │
│  Docker Redis   │         │  Redis (Docker/  │
│  localhost:6379 │         │   Native/Cloud)  │
│                 │         │                 │
│  WebSocket      │         │  WebSocket      │
│  Service        │         │  Service        │
└─────────────────┘         └─────────────────┘
```

## Option 1: Docker on EC2 (Recommended)

If Docker is installed on your EC2 instance:

```bash
# Start Redis container
docker run -d \
  --name sakura-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine

# Verify it's running
docker ps | grep redis
docker logs sakura-redis

# Test connection
docker exec sakura-redis redis-cli ping
# Should return: PONG
```

**Update your `.env` on EC2:**
```env
WS_REDIS_URL=redis://localhost:6379/0
```

## Option 2: Native Redis Installation on EC2

```bash
# Install Redis
sudo yum update -y
sudo yum install redis -y

# Or on Ubuntu/Debian:
# sudo apt update
# sudo apt install redis-server -y

# Start Redis service
sudo systemctl start redis
sudo systemctl enable redis  # Auto-start on reboot

# Verify
redis-cli ping
# Should return: PONG
```

**Update your `.env` on EC2:**
```env
WS_REDIS_URL=redis://localhost:6379/0
```

## Option 3: Managed Redis Service (Production Recommended)

For production, consider using a managed Redis service:

### AWS ElastiCache
- Fully managed Redis on AWS
- High availability, automatic backups
- Secure and scalable

### Redis Cloud / Upstash
- Free tier available
- Easy setup
- Good for development/small production

**Update your `.env` on EC2:**
```env
WS_REDIS_URL=redis://your-redis-endpoint:6379/0
# Or with password:
WS_REDIS_URL=redis://:password@your-redis-endpoint:6379/0
```

## Quick Setup Script for EC2

Save this as `setup-redis.sh` on EC2:

```bash
#!/bin/bash
set -e

echo "🔧 Setting up Redis on EC2..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found, using Docker..."
    
    # Stop existing container if any
    docker stop sakura-redis 2>/dev/null || true
    docker rm sakura-redis 2>/dev/null || true
    
    # Start Redis container
    docker run -d \
      --name sakura-redis \
      --restart unless-stopped \
      -p 6379:6379 \
      redis:7-alpine
    
    echo "✅ Redis container started"
    docker ps | grep redis
    
elif command -v redis-server &> /dev/null; then
    echo "✅ Redis installed, starting service..."
    sudo systemctl start redis
    sudo systemctl enable redis
    echo "✅ Redis service started"
    
else
    echo "❌ Neither Docker nor Redis found. Installing Redis..."
    sudo yum install -y redis || sudo apt-get install -y redis-server
    sudo systemctl start redis
    sudo systemctl enable redis
    echo "✅ Redis installed and started"
fi

# Test connection
echo "🧪 Testing Redis connection..."
if command -v docker &> /dev/null; then
    docker exec sakura-redis redis-cli ping
else
    redis-cli ping
fi

echo "✅ Redis setup complete!"
echo "📍 Redis URL: redis://localhost:6379/0"
```

Make it executable and run:
```bash
chmod +x setup-redis.sh
./setup-redis.sh
```

## Verify Redis is Working

After setup, test from your WebSocket service:

```bash
# On EC2, test Redis connection
redis-cli ping
# Should return: PONG

# Or if using Docker:
docker exec sakura-redis redis-cli ping

# Test from Python (in your venv)
source venv/bin/activate
python -c "import redis; r = redis.Redis.from_url('redis://localhost:6379/0'); print('✅ Redis connected!' if r.ping() else '❌ Redis failed')"
```

## Update Your WebSocket Service Configuration

Make sure your `.env` file on EC2 has the correct Redis URL:

```env
WS_REDIS_URL=redis://localhost:6379/0
```

If using a managed Redis service, update with the actual endpoint:
```env
WS_REDIS_URL=redis://your-redis-endpoint.cache.amazonaws.com:6379/0
```

## Important Notes

1. **Local vs EC2 are separate**: Your local Docker Redis won't affect EC2 at all
2. **Both need Redis**: Each environment needs its own Redis instance
3. **Configuration is separate**: Local uses `localhost:6379`, EC2 uses its own Redis
4. **Security**: For production, consider:
   - Using managed Redis with authentication
   - Restricting Redis to localhost only (default)
   - Using SSL/TLS for remote connections

## Troubleshooting

### Redis connection fails on EC2
```bash
# Check if Redis is running
sudo systemctl status redis
# Or
docker ps | grep redis

# Check if port is open
netstat -tuln | grep 6379

# Test connection
redis-cli ping
```

### Firewall blocking Redis
```bash
# If you need Redis accessible from outside (not recommended for production)
# Update security group to allow port 6379
# But better to keep it localhost-only
```

### Redis not persisting data
```bash
# For Docker, add volume:
docker run -d \
  --name sakura-redis \
  -v redis-data:/data \
  redis:7-alpine redis-server --appendonly yes
```

