# 🔍 **WEBSOCKET DIAGNOSTIC - QUICK CHECK**

## ⚡ **5-Minute Test:**

### **Test 1: Is WebSocket Connecting?**

**Open Dashboard → Press F12 → Console**

**Look for:**
```javascript
🔌 Attempting to connect to WebSocket: ws://localhost:8000/ws/dashboard
✅ WebSocket connected
```

**✅ If you see this:** WebSocket is working  
**❌ If you DON'T see this:** Backend WebSocket endpoint not running

---

### **Test 2: Is Dashboard Subscribing?**

**In same console, look for:**
```javascript
📝 Subscribing to chat_updates...
📊 Total subscribers for chat_updates: 1
📤 Sending subscribe message for chat_updates...
✅ Subscribed to: chat_updates
```

**✅ If you see this:** Dashboard is subscribed  
**❌ If you DON'T see this:** Subscription failed

---

### **Test 3: Does Backend See the Subscription?**

**In Backend Terminal, after dashboard opens:**
```
WebSocket connected: [some-id]
✅ Connection [some-id] subscribed to chat_updates
   Total subscribers for chat_updates: 1
```

**✅ If you see this:** Backend knows dashboard is subscribed  
**❌ If you DON'T see this:** Connection not established

---

### **Test 4: Send Widget Message**

**Widget → Type "test" → Send**

**Check Backend Terminal:**
```
📥 WIDGET MESSAGE RECEIVED
Chat ID: xxx
📡 Broadcasting chat_updates to 1 subscriber(s)
✅ Successfully sent message to connection [id]
✅ Quick notification broadcast completed
```

**✅ If you see this:** Backend is broadcasting  
**❌ If you DON'T see this:** Broadcast failing

---

### **Test 5: Does Dashboard Receive?**

**Dashboard Console should show:**
```javascript
🔵 Raw WebSocket message received: {...}
📡 Broadcasting chat_updates to subscribers...
🔔 New message notification received, refetching chats...
```

**✅ If you see this:** Dashboard received notification  
**❌ If you DON'T see this:** WebSocket message not reaching dashboard

---

## 📊 **Result Matrix:**

| Test | Dashboard Console | Backend Terminal | Status |
|------|-------------------|------------------|--------|
| 1 | `✅ WebSocket connected` | `WebSocket connected` | ✅ Connected |
| 2 | `✅ Subscribed to` | `subscribed to chat_updates` | ✅ Subscribed |
| 3 | - | `Total subscribers: 1` | ✅ Backend aware |
| 4 | - | `📡 Broadcasting to 1` | ✅ Broadcasting |
| 5 | `🔔 New message notification` | - | ✅ Received |

---

## 🚨 **Common Issues:**

### **Issue: WebSocket Not Connecting**
```
Error: WebSocket connection failed
```

**Fix:**
1. Backend not running → Start backend
2. Wrong WebSocket URL → Check `ws://localhost:8000/ws/dashboard`
3. CORS blocking → Check backend CORS settings

---

### **Issue: No Subscribers**
```
⚠️ No subscribers for chat_updates
```

**Fix:**
1. Dashboard not open → Open dashboard
2. Dashboard not subscribing → Hard refresh dashboard (`Ctrl+Shift+R`)
3. WebSocket disconnected → Refresh dashboard

---

### **Issue: Message Not Appearing in Dashboard**
```
✅ Notification received
(but UI doesn't update)
```

**Fix:**
1. Check Network tab for `GET /api/debug/users-chats`
2. Check response includes new message
3. Check dashboard filters (user/section)

---

## ⚡ **FASTEST TEST:**

**Run this in exactly this order:**

1. **Backend Terminal:** Look for server running
2. **Open Dashboard:** `http://localhost:3000/inbox`
3. **Dashboard Console:** Should see `✅ WebSocket connected`
4. **Backend Terminal:** Should see `Total subscribers: 1`
5. **Open Widget:** `http://localhost:3000/widget`
6. **Widget:** Send "test"
7. **Dashboard Console:** Should see `🔔 New message notification`
8. **Dashboard UI:** Message should appear!

**If any step fails, that's where the problem is.** 🎯

---

## 📝 **Copy/Paste This to Report Issue:**

```
Dashboard WebSocket Status:
□ Connected: YES / NO
□ Subscribed: YES / NO
□ Console logs: [paste here]

Backend WebSocket Status:
□ Connection received: YES / NO
□ Subscription received: YES / NO
□ Broadcast sent: YES / NO
□ Terminal logs: [paste here]

Message Flow:
□ Widget sent: YES / NO
□ Backend received: YES / NO
□ Backend broadcast: YES / NO
□ Dashboard received: YES / NO
□ Dashboard UI updated: YES / NO
```

---

**The WebSocket system is fully implemented. Use this diagnostic to find exactly where it's failing!** 🔧
