# 🔍 Debugging Empty Dashboard Requests

## ❌ **Current Issue:**
Dashboard is sending **empty request bodies** repeatedly, causing 400 errors:
```
❌ Failed to parse request body: Expecting value: line 1 column 1 (char 0)
INFO: 127.0.0.1 - "POST /api/dashboard/chats/.../send HTTP/1.1" 400 Bad Request
```

This is spamming the backend with dozens of failed requests.

---

## ✅ **Fixes Applied:**

### **1. Backend: Better Error Logging**
Now shows:
- Request method, content-type, origin
- Raw body length
- Exactly what's being received

### **2. Dashboard: Prevent Empty Messages**
Added guards to stop empty messages from being sent:
```typescript
if (!message || message.trim().length === 0) {
  console.warn('⚠️ Attempted to send empty message, ignoring');
  return;
}
```

### **3. Dashboard: Debug Logging**
Every `sendMessage` call now logs:
```
📤 sendMessage called - Message: "...", Length: X
```

---

## 🧪 **Test Steps:**

### **Step 1: Restart Backend**
```bash
cd sakura-backend-clean
python -m uvicorn app.main:app --reload --port 8000
```

### **Step 2: Refresh Dashboard**
Hard refresh: **Ctrl+Shift+R**

### **Step 3: Clear Dashboard Console**
1. Open DevTools (F12)
2. Go to Console tab
3. Click "Clear console" button

### **Step 4: Try Sending Message from Dashboard**
1. Select a chat
2. Type a message
3. Click Send

---

## 📊 **What to Look For:**

### **Dashboard Console (Good):**
```
📤 sendMessage called - Message: "test", Length: 4
✅ Message sent successfully to chat ...
```

### **Dashboard Console (Bad - Empty Message):**
```
📤 sendMessage called - Message: "", Length: 0
⚠️ Attempted to send empty message, ignoring
```

### **Backend Console (Good):**
```
📨 Dashboard send request - Method: POST, Chat ID: ..., Content-Type: application/json
📦 Raw body length: 45 bytes
📥 Parsed body: {'content': 'test', 'role': 'agent'}
💬 Dashboard sending message - Role: 'agent', Content: 'test'
✅ Quick notification broadcast sent (dashboard message)
```

### **Backend Console (Bad - Empty Body):**
```
📨 Dashboard send request - Method: POST, ...
📦 Raw body length: 0 bytes
⚠️ Empty request body received!
```

---

## 🔎 **Identifying the Spam Source:**

If you still see repeated empty requests:

### **Check 1: Is sendMessage being called?**
Look in dashboard console - should see:
```
📤 sendMessage called - Message: "", Length: 0
```

If you see this repeatedly without clicking Send, something is calling sendMessage in a loop.

### **Check 2: What's triggering it?**
Possible causes:
1. **useEffect loop** - Some dependency causing re-renders
2. **WebSocket event handler** - Notification triggering a send somehow
3. **Button double-click** - User clicking Send multiple times
4. **React StrictMode** - Calling effects twice in development

### **Check 3: Pattern of requests**
- **All at once?** → Likely a single action triggering multiple
- **Continuous stream?** → Likely a loop or interval
- **After specific action?** → Triggered by that action

---

## 🛠️ **If Spam Continues:**

### **Temporary Fix: Rate Limiting**
Add to dashboard sendMessage:
```typescript
let lastSendTime = 0;
const MIN_SEND_INTERVAL = 1000; // 1 second

const sendMessage = async (message: string) => {
  const now = Date.now();
  if (now - lastSendTime < MIN_SEND_INTERVAL) {
    console.warn('⚠️ Rate limited: Too many send attempts');
    return;
  }
  lastSendTime = now;
  // ... rest of code
}
```

---

## 📝 **What to Report Back:**

After testing, please share:

1. **Dashboard Console Output**
   - Do you see `📤 sendMessage called...`?
   - How many times?
   - What message content?

2. **Backend Console Output**
   - Do you see `📦 Raw body length: X bytes`?
   - What's the length?
   - Still seeing spam?

3. **User Action**
   - What did you do? (click send, refresh, etc.)
   - How many times did you click?

4. **Behavior**
   - Single request or multiple?
   - Error still 400 Bad Request?
   - Or now 200 OK?

---

## ✅ **Expected Working Behavior:**

### **Dashboard → Widget:**
1. Type message in dashboard
2. Click Send **once**
3. **Dashboard Console:**
   ```
   📤 sendMessage called - Message: "hello", Length: 5
   ✅ Message sent successfully
   ```
4. **Backend Console:**
   ```
   📦 Raw body length: 40 bytes
   ✅ Quick notification broadcast sent
   ```
5. **Widget updates within 2 seconds**

### **Widget → Dashboard:**
1. Type message in widget
2. Click Send
3. **Backend Console:**
   ```
   📥 WIDGET MESSAGE RECEIVED
   ✅ Quick notification broadcast sent
   ```
4. **Dashboard Console:**
   ```
   🔔 New message notification received, refetching chats...
   ```
5. **Dashboard updates immediately**

---

## 🚨 **Emergency Stop:**

If backend is getting hammered and you need to stop it:

**Kill backend:** Press **Ctrl+C** in backend terminal

**Close dashboard tab** to stop the requests

**Then:**
1. Restart backend
2. Hard refresh dashboard (Ctrl+Shift+R)
3. Test again with console open

---

Test now and share the console outputs! 🔍
