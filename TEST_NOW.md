# 🧪 IMMEDIATE TEST STEPS

## **Step 1: Restart Backend (if not already done)**

```bash
cd sakura-backend-clean
python -m uvicorn app.main:app --reload --port 8000
```

Wait for:
```
INFO:     Application startup complete.
```

---

## **Step 2: Refresh Widget**

1. Open widget in browser
2. Press **Ctrl+Shift+R** (hard refresh)
3. Open DevTools: **F12**
4. Go to **Console** tab

You should immediately see:
```
🌐 Widget API URL: http://localhost:8000
⚙️ Environment: development
```

**❌ If you see a different URL, that's the problem!**

---

## **Step 3: Send Message from Widget**

1. Type a test message in widget
2. Click Send

**Watch the Console - should see:**
```
📤 Saving user message to chat chat_xxx...
✅ User message saved to chat: chat_xxx
💬 Sending chat payload to backend: {...}
```

**❌ If you see:**
```
❌ Failed to save message - Status: 404
```
That means the backend endpoint isn't found.

**❌ If you see:**
```
❌ Error saving message to chat instance: ...
```
That means network error or backend not running.

---

## **Step 4: Check Backend Console**

Your backend terminal should show:
```
============================================================
📥 WIDGET MESSAGE RECEIVED
============================================================
Chat ID: chat_xxx
Request data: {'content': 'test message', 'role': 'user'}
============================================================

💬 Message content: 'test message'
👤 Message role: 'user'
✅ Message saved to chat chat_xxx (role: user)
✅ Immediate WebSocket broadcast triggered (widget message)
```

**❌ If you see NOTHING:**
- Backend isn't receiving the request
- Wrong port/URL
- CORS issue
- Backend not restarted with new code

---

## **Step 5: Check Dashboard**

1. Open dashboard inbox
2. Should see the message appear (within 2 seconds)

**If message doesn't appear, check dashboard console (F12):**
```
📨 Received WebSocket chat update
```

---

## 🚨 **If Still Not Working**

### **Backend Not Receiving Requests:**

1. Check backend is running on port 8000:
   - Open: http://localhost:8000/api/health
   - Should show: `{"status":"ok"}`

2. Check CORS is configured:
   ```python
   # In main.py, should have:
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. Check widget is using correct URL:
   ```javascript
   // Widget console should show:
   🌐 Widget API URL: http://localhost:8000
   ```

### **Widget Can't Connect:**

Check widget .env file:
```bash
# widget/.env.local (if exists)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 📋 **Copy-Paste Commands**

### Test Backend Health:
```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{"status":"ok"}
```

### Test Widget Endpoint:
```bash
curl -X POST http://localhost:8000/api/users/chats/chat_test123/send \
  -H "Content-Type: application/json" \
  -d '{"content":"test","role":"user"}'
```

Should return:
```json
{"success":true,"message":"Message sent successfully"}
```

And backend should print:
```
============================================================
📥 WIDGET MESSAGE RECEIVED
============================================================
```

---

## ✅ **What to Report Back**

Please share:

1. **Widget Console Output** (when you send message)
2. **Backend Console Output** (should show the big banner)
3. **Any error messages** anywhere

This will help me identify exactly where it's failing! 🔍
