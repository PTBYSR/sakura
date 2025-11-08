# WebSocket Microservice Setup & Runbook

This guide explains how to run the new WebSocket microservice alongside the existing Sakura backend and dashboard.

---

## 1. Install Dependencies

### Backend (FastAPI API service)
```bash
cd sakura-backend-clean
pip install -r requirements.txt
```

### WebSocket microservice
```bash
cd ../sakura-websocket-service
pip install -r requirements.txt
```

> **Tip:** Use a virtual environment (e.g., `python -m venv .venv && .venv\Scripts\activate`) before installing packages.

### Frontend (optional reinstall)
If you haven’t already:
```bash
cd ../dashboard
npm install
```

---

## 2. Start Redis

The backend now publishes chat notifications to Redis. Run a local Redis instance (Docker is easiest):

```bash
docker run --name sakura-redis -p 6379:6379 redis:7-alpine
```

If you already have Redis installed natively, make sure it is running on `redis://localhost:6379/0` or update the URLs in the `.env` files (see below).

---

## 3. Configure Environment Variables

### `sakura-backend-clean/.env`
Add (or confirm) the Redis URL so the backend publisher can connect:
```
REDIS_URL=redis://localhost:6379/0
```

### `sakura-websocket-service/.env`
Create this file (if it does not exist) with:
```
WS_SERVICE_HOST=0.0.0.0
WS_SERVICE_PORT=8001
WS_REDIS_URL=redis://localhost:6379/0
WS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
WS_MONGO_URI=mongodb://localhost:27017
WS_MONGO_DB=sakura
WS_CHAT_SNAPSHOT_INTERVAL=2
WS_UNREAD_SNAPSHOT_INTERVAL=5
```
Adjust the Mongo/Redis values if your services run elsewhere.

### `dashboard/.env.local`
Point the dashboard to the new WebSocket endpoint:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8001
```
If `NEXT_PUBLIC_WS_BASE_URL` is omitted, the dashboard will auto-derive the URL by switching to port `8001` in development.

---

## 4. Run Each Service

Open three terminals (or use a process manager like `npm-run-all`/`pm2`). Always start Redis first.

1. **Redis** – (from step 2) ensure it keeps running.
2. **Backend API**
   ```bash
   cd sakura-backend-clean
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. **WebSocket microservice**
   ```bash
   cd sakura-websocket-service
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```
4. **Dashboard (Next.js)**
   ```bash
   cd dashboard
   npm run dev
   ```

---

## 5. Verify the Flow

1. **Dashboard console** – load `http://localhost:3000/inbox`, open devtools, and confirm logs:
   - `🔌 Attempting to connect to WebSocket: ws://localhost:8001/ws/dashboard`
   - `✅ WebSocket connected`
   - `✅ Subscribed to: chat_updates`

2. **Backend logs** – when a widget/dashboard message is sent, you should see:
   - `✅ Quick notification published to Redis (widget message)`

3. **WebSocket service logs** – confirm it broadcasts to subscribers:
   - `📡 Subscribed to Redis channels: chat_updates, unread_counts, website_status`
   - `WebSocket connected: <id>`
   - `Sent chat_updates to <id>` (debug level)

4. **Redis** – optional: `docker logs sakura-redis` to ensure the container is healthy.

---

## 6. Troubleshooting

- **No real-time updates**
  - Confirm Redis is running and reachable.
  - Check `NEXT_PUBLIC_WS_BASE_URL` and browser console for connection errors.
  - Ensure both backend and WebSocket service started without exceptions.

- **Redis authentication or custom host**
  - Update `REDIS_URL` and `WS_REDIS_URL` with credentials, e.g., `redis://:password@hostname:6379/0`.

- **Port conflicts**
  - If `8001` is already in use, change `WS_SERVICE_PORT` and `NEXT_PUBLIC_WS_BASE_URL` accordingly.

---

## 7. Deployment Notes

- Host the WebSocket service separately (e.g., dedicated container/pod).
- Use a managed Redis instance for production.
- Expose the service through HTTPS (e.g., behind Nginx/Traefik) to upgrade to `wss://`.
- Scale horizontally by running multiple WebSocket service instances behind a load balancer; Redis pub/sub fan-out keeps broadcasts consistent.
