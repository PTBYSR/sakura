# Running Redis on Windows using WSL

If you have WSL (Windows Subsystem for Linux) installed:

1. Open WSL terminal (Ubuntu or your Linux distro)
2. Install Redis:
   ```bash
   sudo apt update
   sudo apt install redis-server -y
   ```
3. Start Redis:
   ```bash
   sudo service redis-server start
   ```
4. Verify it's running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

Redis will be accessible from Windows at `redis://localhost:6379/0`

