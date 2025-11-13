Here’s a clean, shortened **`ec2-putty-guide.md`** version you can save or share:

---

```markdown
# 🖥️ Connect to EC2 Instances Using PuTTY (Windows)

## Prerequisites
- PuTTY + PuTTYgen installed  
- Your EC2 key pair (`.pem` file)  
- Public IPs:
  - **Backend:** 54.242.153.152  
  - **WebSocket:** 34.224.167.64  

---

## 1. Convert `.pem` to `.ppk`
1. Open **PuTTYgen**  
2. Click **Load** → select your `.pem` file  
3. Click **Save private key** → save as `my-key.ppk`

---

## 2. Connect via PuTTY
1. Open **PuTTY**  
2. **Host Name:**  
   - For backend → `ec2-user@54.242.153.152`  
   - For websocket → `ec2-user@34.224.167.64`
3. Go to `Connection → SSH → Auth` → click **Browse** → select your `.ppk` key  
4. Return to **Session** → click **Open**
5. Accept the prompt → you’ll see:  
```

[ec2-user@ip-172-31-xx-xx ~]$

````

---

## 3. Common Commands
```bash
# List files
ls -l

# Navigate to your backend folder
cd /data/sakura-backend-clean

# Activate Python venv
source venv/bin/activate

# Run backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
````

---

✅ **Done!** You’re now connected to your EC2 instance.

```

---

Would you like me to add the section for **auto-starting your backend using `pm2` or `systemd`** next?
```
