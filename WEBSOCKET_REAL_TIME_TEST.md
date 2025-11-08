# 🔴 **WEBSOCKET REAL-TIME TESTING GUIDE**

## 📋 **Overview:**

This guide walks you through testing the **Widget → Dashboard** real-time messaging flow using WebSocket.

---

## 🔧 **Prerequisites:**

1. ✅ Backend running on `http://localhost:8000`
2. ✅ Dashboard running on `http://localhost:3000`
3. ✅ Widget running on `http://localhost:3000/widget`

---

## 🧪 **Test Setup:**

### **Step 1: Open Dashboard**
1. Open `http://localhost:3000/inbox` in **Chrome/Edge**
2. **Press F12** → Open Console tab
3. **Keep console open and visible**

### **Expected Console Output:**
```javascript
🔌 Attempting to connect to WebSocket: ws://localhost:8000/ws/dashboard
✅ WebSocket connected
✅ WebSocket connection confirmed: [connection_id]
📝 Subscribing to chat_updates...
📊 Total subscribers for chat_updates: 1
📤 Sending subscribe message for chat_updates...
✅ Subscribed to: chat_updates
```

**✅ If you see this:** WebSocket is connected and subscribed!  
**❌ If you don't see this:** WebSocket connection failed - check backend is running.

---

### **Step 2: Open Widget**
1. Open `http://localhost:3000/widget` in **another tab or incognito window**
2. **Press F12** → Open Console tab
3. Fill out the contact form and start a chat
4. **Keep widget console open**

---

### **Step 3: Send Message from Widget**
1. **In widget**, type: `Hello from customer`
2. Click **Send**

---

## 📊 **Expected Flow & Logs:**

### **A. Widget Console:**
```javascript
📤 Sending message: "Hello from customer"
✅ Message sent successfully
```

---

### **B. Backend Terminal:**
```
============================================================
📥 WIDGET MESSAGE RECEIVED
============================================================
Chat ID: 8942b9df-77c8-4e5f-a7eb-097aace75053
============================================================

📥 Parsed JSON body: {'content': 'Hello from customer', 'role': 'user'}
💬 Message content: 'Hello from customer'
👤 Message role: 'user'

📡 Broadcasting chat_updates to 1 subscriber(s)
   Message: {
     "type": "chat_updates",
     "data": {
       "type": "chat_message_notification",
       "chat_id": "8942b9df-77c8-4e5f-a7eb-097aace75053",
       "message_role": "user",
       "timestamp": "2025-11-08T12:00:00.123456"
     }
   }

✅ Successfully sent message to connection [connection_id]
✅ Quick notification broadcast completed (widget message)
✅ Message saved to chat 8942b9df... (role: user)

INFO: "POST /api/users/chats/.../send HTTP/1.1" 200 OK
```

**✅ Key things to see:**
- `Broadcasting chat_updates to 1 subscriber(s)` ← Dashboard is subscribed!
- `✅ Successfully sent message to connection` ← WebSocket sent!
- `✅ Quick notification broadcast completed` ← Broadcast succeeded!

---

### **C. Dashboard Console:**
```javascript
🔵 Raw WebSocket message received: {
  "type": "chat_updates",
  "data": {
    "type": "chat_message_notification",
    "chat_id": "8942b9df-77c8-4e5f-a7eb-097aace75053",
    "message_role": "user",
    "timestamp": "2025-11-08T12:00:00.123456"
  }
}

📡 Broadcasting chat_updates to subscribers...
📬 Found 1 subscriber(s) for chat_updates
  → Calling callback 1...
  
📨 Received WebSocket update: {
  "type": "chat_message_notification",
  "chat_id": "8942b9df-77c8-4e5f-a7eb-097aace75053",
  "message_role": "user",
  "timestamp": "2025-11-08T12:00:00.123456"
}

🔔 New message notification received, refetching chats...
📊 Notification details: {
  chat_id: "8942b9df-77c8-4e5f-a7eb-097aace75053",
  message_role: "user",
  timestamp: "2025-11-08T12:00:00.123456"
}

  ✅ Callback 1 executed successfully
```

**✅ Key things to see:**
- `📡 Broadcasting chat_updates to subscribers...` ← Message received!
- `🔔 New message notification received, refetching chats...` ← Triggering refetch!
- `✅ Callback 1 executed successfully` ← Handler ran!

---

### **D. Dashboard UI:**
**Within 1-2 seconds:**
- ✅ Message "Hello from customer" appears in the chat list
- ✅ Chat moves to top of list (if sorted by recent)
- ✅ Message count updates
- ✅ Preview shows latest message

---

## ❌ **Troubleshooting:**

### **Problem 1: Dashboard Console Shows Nothing**

**Symptoms:**
```
(no WebSocket logs at all)
```

**Causes:**
1. WebSocket not connecting
2. Dashboard page not loaded correctly
3. Cache issue

**Solutions:**
1. **Check Backend Running:**
   ```bash
   # Should see uvicorn logs
   INFO:     Uvicorn running on http://127.0.0.1:8000
   ```

2. **Hard Refresh Dashboard:**
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Or open in **Incognito mode**

3. **Check Backend Logs for WebSocket Connection:**
   ```
   WebSocket connected: [connection_id]
   ✅ Connection [connection_id] subscribed to chat_updates
   ```

---

### **Problem 2: WebSocket Connects But No Messages**

**Symptoms:**
```javascript
✅ WebSocket connected
✅ Subscribed to: chat_updates
// ... but nothing when widget sends message
```

**Causes:**
1. Backend not broadcasting
2. No subscribers
3. Dashboard user filter blocking messages

**Solutions:**
1. **Check Backend Logs When Widget Sends Message:**
   ```
   📡 Broadcasting chat_updates to X subscriber(s)
   ```
   - If `X = 0`: Dashboard not subscribed
   - If `X = 1`: Should work!

2. **Check Backend After Dashboard Opens:**
   ```
   ✅ Connection [id] subscribed to chat_updates
   Total subscribers for chat_updates: 1
   ```

3. **Check Dashboard Console:**
   ```javascript
   📝 Subscribing to chat_updates...
   📤 Sending subscribe message for chat_updates...
   ```

---

### **Problem 3: Message Received But Dashboard Doesn't Update**

**Symptoms:**
```javascript
🔔 New message notification received, refetching chats...
// ... but UI doesn't change
```

**Causes:**
1. Refetch failing
2. Data transformation error
3. Filter excluding the chat

**Solutions:**
1. **Check Network Tab:**
   - Should see `GET /api/debug/users-chats` after notification
   - Status should be `200 OK`

2. **Check Response:**
   - Should include the new message in the chat data

3. **Check Dashboard Console for Errors:**
   ```javascript
   ❌ Error in subscription callback...
   ```

---

### **Problem 4: Backend Says "No subscribers"**

**Symptoms:**
```
⚠️ No subscribers for chat_updates, message will not be delivered
```

**Causes:**
- Dashboard opened but didn't subscribe
- WebSocket connected but subscription failed
- Dashboard closed/refreshed

**Solutions:**
1. **Refresh Dashboard**
2. **Check Backend Logs for:**
   ```
   WebSocket connected: [connection_id]
   ✅ Connection [connection_id] subscribed to chat_updates
   Total subscribers for chat_updates: 1
   ```

3. **If still 0 subscribers:**
   - Dashboard WebSocket context not initialized
   - Check dashboard console for WebSocket errors

---

## ✅ **Success Criteria:**

**When working correctly:**

1. ✅ **Dashboard console shows WebSocket connection**
2. ✅ **Backend shows 1 subscriber when dashboard opens**
3. ✅ **Widget sends message → Backend logs broadcast**
4. ✅ **Dashboard console shows notification received**
5. ✅ **Dashboard UI updates within 1-2 seconds**

---

## 🔍 **Quick Debug Checklist:**

```
□ Backend running?                    → uvicorn logs visible
□ Dashboard WebSocket connected?      → ✅ WebSocket connected
□ Dashboard subscribed?               → ✅ Subscribed to: chat_updates
□ Backend shows subscriber?           → Total subscribers: 1
□ Widget message sent?                → POST 200 OK
□ Backend broadcasts?                 → 📡 Broadcasting...
□ Dashboard receives?                 → 🔵 Raw WebSocket message
□ Dashboard refetches?                → 🔔 refetching chats...
□ UI updates?                         → Message visible
```

---

## 🎯 **Quick Test Command:**

1. Open dashboard → Check console for "✅ WebSocket connected"
2. Open widget → Send "test"  
3. Check dashboard console for "🔔 New message notification"
4. Check dashboard UI for message

**Total time: < 5 seconds** ⚡

---

## 📞 **Need Help?**

Share these logs:
1. **Dashboard console** (full output after opening page)
2. **Backend terminal** (logs when widget sends message)
3. **Network tab** (WebSocket connection status)

---

**The WebSocket system is already fully built with comprehensive logging. Follow this guide to verify it's working!** 🚀
