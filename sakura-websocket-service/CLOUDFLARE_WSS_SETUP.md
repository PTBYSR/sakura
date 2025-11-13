# Cloudflare WSS Setup Guide

## Overview
Setting up secure WebSocket (WSS) through Cloudflare with Nginx reverse proxy on EC2.

## Architecture
```
Client → Cloudflare (SSL) → Nginx (EC2) → WebSocket Service (Port 8001)
```

## Step 1: Install Nginx on EC2

```bash
# Install Nginx
sudo yum install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## Step 2: Configure Nginx for WebSocket

Create Nginx configuration for WebSocket proxy:

```bash
# Create Nginx config for WebSocket
sudo nano /etc/nginx/conf.d/websocket.conf
```

Add this configuration:

```nginx
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
```

## Step 3: Test Nginx Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# If successful, reload Nginx
sudo systemctl reload nginx
```

## Step 4: Configure Cloudflare

### 4.1 DNS Settings
1. Go to Cloudflare Dashboard → DNS
2. Add/Update A record:
   - **Name**: `ws`
   - **Content**: `34.224.167.64` (your EC2 IP)
   - **Proxy status**: ✅ Proxied (Orange cloud)
   - **TTL**: Auto

### 4.2 SSL/TLS Settings
1. Go to Cloudflare Dashboard → SSL/TLS
2. Set encryption mode to **Full (strict)**
3. This ensures Cloudflare encrypts traffic to your origin

### 4.3 Network Settings (Enable WebSocket)
1. Go to Cloudflare Dashboard → Network
2. Enable **WebSockets** (should be enabled by default)
3. If not, go to Speed → Optimization → WebSockets and enable it

### 4.4 Firewall Rules (Optional but Recommended)
Create a firewall rule to only allow WebSocket connections:
1. Go to Security → WAF → Custom rules
2. Create rule to allow WebSocket upgrades:
   - Rule name: Allow WebSocket
   - Expression: `(http.request.uri.path contains "/ws/") or (http.request.headers["upgrade"] eq "websocket")`
   - Action: Allow

## Step 5: Update WebSocket Service Configuration

Update your WebSocket service to accept connections from Nginx:

```bash
# Edit ecosystem.config.js
cd /home/ec2-user/sakura/sakura-websocket-service
nano ecosystem.config.js
```

Update the `WS_ALLOWED_ORIGINS` to include your domain:

```javascript
env: {
  // ... other vars
  WS_ALLOWED_ORIGINS: 'https://sakurasupport.live,https://www.sakurasupport.live,https://ws.sakurasupport.live,http://localhost:3000,http://127.0.0.1:3000',
  // ... other vars
}
```

Or create/update `.env` file:

```bash
nano .env
```

Add:
```env
WS_ALLOWED_ORIGINS=https://sakurasupport.live,https://www.sakurasupport.live,https://ws.sakurasupport.live
```

Restart PM2:
```bash
pm2 restart websocket-service
pm2 save
```

## Step 6: Update Dashboard Configuration

Update your dashboard to use the WSS URL:

```bash
# On your local machine or where dashboard is deployed
# Edit dashboard/.env.local or dashboard/.env
```

Add:
```env
NEXT_PUBLIC_WS_BASE_URL=wss://ws.sakurasupport.live
```

## Step 7: Update EC2 Security Group

Update your EC2 security group to allow HTTP/HTTPS from Cloudflare:

1. Go to AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Add inbound rules:
   - **Type**: HTTP (Port 80)
   - **Source**: Cloudflare IPs (or 0.0.0.0/0 if you want Cloudflare to handle security)
   - **Type**: HTTPS (Port 443) - Optional if using SSL
   - **Source**: Cloudflare IPs

**Note**: With Cloudflare proxying, you can restrict port 80/443 to Cloudflare IPs only:
- Get Cloudflare IP ranges: https://www.cloudflare.com/ips/
- Or use: `0.0.0.0/0` and let Cloudflare's firewall handle security

## Step 8: Test the Setup

### 8.1 Test from EC2
```bash
# Test Nginx is proxying correctly
curl -H "Upgrade: websocket" http://localhost/ws/dashboard
curl http://localhost/health
```

### 8.2 Test from Local Machine
```bash
# Test through Cloudflare
curl https://ws.sakurasupport.live/health

# Should return:
# {"status":"ok","mongo":"healthy","redis":"connected"}
```

### 8.3 Test WebSocket Connection
Open browser console on your dashboard and check WebSocket connection:
```javascript
// Should connect to: wss://ws.sakurasupport.live/ws/dashboard
```

## Step 9: Monitor and Maintain

### Check Nginx Logs
```bash
# Check access logs
sudo tail -f /var/log/nginx/websocket_access.log

# Check error logs
sudo tail -f /var/log/nginx/websocket_error.log
```

### Check PM2 Status
```bash
pm2 status
pm2 logs websocket-service
```

### Verify WebSocket Connections
```bash
# Check active WebSocket connections
sudo netstat -an | grep :8001
```

## Troubleshooting

### Issue: 502 Bad Gateway
**Fix**: Check if WebSocket service is running:
```bash
pm2 status
curl http://localhost:8001/health
```

### Issue: WebSocket Connection Fails
**Fix**: 
1. Check Cloudflare WebSocket is enabled
2. Verify Nginx config has WebSocket headers
3. Check CORS settings in WebSocket service

### Issue: SSL Certificate Errors
**Fix**: 
1. Ensure Cloudflare SSL/TLS is set to "Full (strict)"
2. Cloudflare will handle SSL, no need for cert on EC2

### Issue: Connection Timeout
**Fix**:
1. Check EC2 security group allows port 80
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check firewall: `sudo firewall-cmd --list-all`

## Security Recommendations

1. **Restrict EC2 Security Group**: Only allow port 80 from Cloudflare IPs
2. **Use Cloudflare Firewall**: Block malicious traffic at Cloudflare level
3. **Enable Cloudflare DDoS Protection**: Automatic protection
4. **Monitor Logs**: Regularly check Nginx and PM2 logs
5. **Keep Services Updated**: Regularly update Nginx and system packages

## Additional: SSL Certificate on EC2 (Optional)

If you want SSL directly on EC2 (not just Cloudflare):

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d ws.sakurasupport.live

# Auto-renewal
sudo systemctl enable certbot.timer
```

But with Cloudflare proxying, this is optional since Cloudflare handles SSL.

## PM2 Auto-Start on Reboot

Ensure PM2 starts on reboot:

```bash
# Generate startup script
pm2 startup

# Follow the instructions it outputs, then:
pm2 save
```

## Nginx Auto-Start on Reboot

Nginx should already be enabled, but verify:

```bash
sudo systemctl enable nginx
sudo systemctl is-enabled nginx
# Should return: enabled
```

## Complete Setup Checklist

- [ ] Nginx installed and running
- [ ] Nginx configuration created for WebSocket
- [ ] Cloudflare DNS configured (ws.sakurasupport.live → EC2 IP)
- [ ] Cloudflare SSL/TLS set to Full (strict)
- [ ] Cloudflare WebSocket enabled
- [ ] EC2 Security Group allows port 80
- [ ] WebSocket service CORS updated
- [ ] Dashboard configured to use wss://ws.sakurasupport.live
- [ ] PM2 configured for auto-start
- [ ] Tested connection from browser
- [ ] Monitored logs for errors

