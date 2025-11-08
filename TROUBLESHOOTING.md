# Polling Troubleshooting Guide

## 🔍 **Step-by-Step Debugging**

### **STEP 1: Restart Backend (CRITICAL!)**
The backend changes won't work until you restart:

```bash
cd sakura-backend-clean
# Stop current backend (Ctrl+C)
python -m uvicorn app.main:app --reload --port 8000
```

**Backend should show:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

---

### **STEP 2: Check Backend Console**

When you send a message, you should see:
```
📥 Dashboard sending message - Role: 'agent', Content: '...'
💾 Saving message to DB - Role: 'agent', Chat ID: chat_xxx
✅ Immediate WebSocket broadcast triggered
```

**OR for widget messages:**
```
✅ Message saved to chat chat_xxx (role: user)
✅ Immediate WebSocket broadcast triggered (widget message)
```

**❌ If you DON'T see these logs:**
- Backend wasn't restarted with new code
- Messages aren't being saved

---

### **STEP 3: Check Widget Console**

Open DevTools (F12) in widget tab. You should see every 2 seconds:

```
🔄 Polling for messages - Chat ID: chat_xxx, Email: user@example.com
📦 Received 1 chats from backend
💬 Chat found with 5 messages
```

**When a new message arrives:**
```
📬 Messages updated - Count: 6
```

**❌ If you see:**
```
⚠️ Chat chat_xxx not found in response
```
- The chat_id doesn't match
- User email doesn't match
- Chat not in database

**❌ If you see:**
```
❌ Poll failed - Status: 404
```
- Backend endpoint not found
- Email format wrong

---

### **STEP 4: Check Dashboard Console**

Open DevTools (F12) in dashboard tab. You should see:

```
🔌 WebSocket connected
✅ Subscribed to chat_updates
📨 Received WebSocket chat update
```

**❌ If you see:**
```
❌ WebSocket connection failed
```
- Backend WebSocket not running
- Wrong WebSocket URL

---

### **STEP 5: Test Message Flow**

#### **Test A: Widget → Dashboard**
1. Widget: Send message "Test from widget"
2. **Backend Console should show:**
   ```
   ✅ Message saved to chat chat_xxx (role: user)
   ✅ Immediate WebSocket broadcast triggered (widget message)
   ```
3. **Dashboard should update within 100ms**

#### **Test B: Dashboard → Widget**
1. Dashboard: Send message "Test from dashboard"
2. **Backend Console should show:**
   ```
   📥 Dashboard sending message - Role: 'agent'
   ✅ Immediate WebSocket broadcast triggered
   ```
3. **Widget Console should show (within 2 seconds):**
   ```
   📬 Messages updated - Count: X
   ```

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: Backend Not Restarted**
**Symptom:** No broadcast logs in backend console

**Fix:**
```bash
# Kill backend process completely
# Restart with:
cd sakura-backend-clean
python -m uvicorn app.main:app --reload --port 8000
```

---

### **Issue 2: Widget Not Finding Chat**
**Symptom:** `⚠️ Chat not found in response`

**Fix:** Check if email and chat_id match:
```javascript
// Widget console
console.log("Current chat ID:", currentChatId);
console.log("Current email:", email);
```

Then check backend:
```bash
# MongoDB query
db["customer-chats"].find_one({"chat_id": "YOUR_CHAT_ID"})
```

---

### **Issue 3: Dashboard Not Showing Chats**
**Symptom:** Empty inbox

**Possible causes:**
1. **User filter mismatch** - dashboard_user_id doesn't match
2. **Category/status mismatch** - Chat in wrong category
3. **WebSocket not connected** - Check connection status

**Debug:**
```javascript
// Dashboard console
console.log("User ID:", userId);
console.log("User Email:", userEmail);
console.log("Is Connected:", isConnected);
```

---

### **Issue 4: Messages Delayed**
**Symptom:** Messages take 5+ seconds to appear

**Causes:**
1. Backend not broadcasting immediately (not restarted)
2. Widget polling failed (check console for errors)
3. Dashboard WebSocket disconnected

**Fix:**
- Restart backend (see Step 1)
- Check console for error messages
- Verify WebSocket connection in dashboard

---

### **Issue 5: Stale/Old Messages**
**Symptom:** New messages don't appear, shows old messages

**Fix:** Clear localStorage and refresh:
```javascript
// Widget console
localStorage.clear();
location.reload();
```

---

## 📊 **Expected Timing**

### **Widget → Dashboard:**
```
Widget sends message
  ↓ (instant)
Backend saves + broadcasts
  ↓ (< 100ms)
Dashboard receives via WebSocket
  ✅ Total: < 200ms
```

### **Dashboard → Widget:**
```
Dashboard sends message
  ↓ (instant)
Backend saves + broadcasts
  ↓ (< 2s polling)
Widget receives via HTTP poll
  ✅ Total: < 2 seconds
```

---

## 🔧 **Manual Testing Commands**

### **Test Backend Endpoints:**

```bash
# Test get chats (replace with your email)
curl http://localhost:8000/api/users/test@example.com/chats

# Test send message (replace chat_id)
curl -X POST http://localhost:8000/api/users/chats/chat_xxx/send \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message","role":"agent"}'
```

### **Test WebSocket:**

```javascript
// Dashboard console
const ws = new WebSocket('ws://localhost:8000/ws/dashboard');
ws.onopen = () => {
  console.log('✅ WebSocket connected');
  ws.send(JSON.stringify({
    action: 'subscribe',
    subscription_type: 'chat_updates'
  }));
};
ws.onmessage = (event) => {
  console.log('📨 Received:', JSON.parse(event.data));
};
```

---

## ✅ **Checklist Before Asking for Help**

- [ ] Backend restarted with latest code
- [ ] Widget browser tab refreshed (Ctrl+Shift+R)
- [ ] Dashboard browser tab refreshed (Ctrl+Shift+R)
- [ ] Backend console shows broadcast logs
- [ ] Widget console shows polling logs
- [ ] Dashboard console shows WebSocket connection
- [ ] No error messages in any console
- [ ] localStorage cleared if seeing stale data

---

## 📝 **What to Report**

If still not working, provide:

1. **Backend console output** (last 20 lines)
2. **Widget console output** (F12 → Console tab)
3. **Dashboard console output** (F12 → Console tab)
4. **Specific behavior:**
   - Which direction fails? (Widget→Dashboard or Dashboard→Widget)
   - Any error messages?
   - How long does it take (if working slowly)?

5. **Environment:**
   - Backend running? (check http://localhost:8000/api/health)
   - MongoDB connected?
   - Which browser?

---

## 🚀 **Quick Reset (Nuclear Option)**

If nothing works, complete reset:

```bash
# 1. Stop everything
# Kill backend (Ctrl+C)

# 2. Clear browser
# Widget: F12 → Application → Clear Storage → Clear site data
# Dashboard: F12 → Application → Clear Storage → Clear site data

# 3. Restart backend
cd sakura-backend-clean
python -m uvicorn app.main:app --reload --port 8000

# 4. Wait for "Application startup complete"

# 5. Hard refresh browsers
# Widget: Ctrl+Shift+R
# Dashboard: Ctrl+Shift+R

# 6. Test again
```

This should fix 90% of issues! 🎉
