#!/bin/bash
# Quick setup script for Nginx WebSocket proxy on EC2

set -e

echo "🔧 Setting up Nginx WebSocket Proxy for ws.sakurasupport.live"

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo yum install nginx -y
else
    echo "✅ Nginx already installed"
fi

# Create Nginx configuration
echo "📝 Creating Nginx configuration..."
sudo tee /etc/nginx/conf.d/websocket.conf > /dev/null << 'EOF'
# WebSocket Proxy Configuration
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream websocket_backend {
    server 127.0.0.1:8001;
}

server {
    listen 80;
    server_name ws.sakurasupport.live;

    # Logging
    access_log /var/log/nginx/websocket_access.log;
    error_log /var/log/nginx/websocket_error.log;

    # WebSocket endpoint
    location /ws/dashboard {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        
        # WebSocket headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for WebSocket
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 60;
        
        # Disable buffering for WebSocket
        proxy_buffering off;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://websocket_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Default location
    location / {
        return 404;
    }
}
EOF

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Start and enable Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start"
    exit 1
fi

# Check firewall
echo "🔥 Checking firewall..."
if sudo systemctl is-active --quiet firewalld; then
    echo "⚠️  Firewalld is running, allowing port 80..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --reload
fi

echo ""
echo "✅ Nginx WebSocket proxy setup complete!"
echo ""
echo "📍 Next steps:"
echo "1. Configure Cloudflare DNS: ws.sakurasupport.live → $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "2. Enable Cloudflare WebSocket in Network settings"
echo "3. Set Cloudflare SSL/TLS to 'Full (strict)'"
echo "4. Update EC2 Security Group to allow port 80"
echo "5. Update WebSocket service CORS to include: https://sakurasupport.live"
echo "6. Update dashboard to use: wss://ws.sakurasupport.live"
echo ""
echo "🧪 Test the setup:"
echo "   curl http://localhost/health"
echo "   curl http://ws.sakurasupport.live/health (after DNS propagation)"

