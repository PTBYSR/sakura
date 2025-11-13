# Git Pull Instructions for EC2

## ✅ Correct Way: Pull from Root Level

Since this is a **monorepo** (all services in one repository), you should pull from the root `/sakura` directory:

```bash
# Navigate to the root of your repository
cd /path/to/sakura  # e.g., /home/ec2-user/sakura

# Pull the latest changes
git pull origin main  # or 'master', or your branch name

# The changes will be pulled for ALL services including:
# - sakura-websocket-service/
# - sakura-backend-clean/
# - dashboard/
# - widget/
```

## ❌ Wrong Way: Don't Pull from Subdirectory

**Don't do this:**
```bash
cd sakura-websocket-service
git pull  # ❌ This won't work if it's a monorepo
```

If `sakura-websocket-service` is not a separate git repository, this will fail or won't pull the changes you need.

## Complete Workflow on EC2

```bash
# 1. Navigate to root
cd /home/ec2-user/sakura  # or wherever your repo is

# 2. Check current status
git status

# 3. Pull latest changes
git pull origin main  # Adjust branch name if different

# 4. Navigate to websocket service
cd sakura-websocket-service

# 5. Verify the new files are there
ls -la
# Should see: ecosystem.config.js, EC2_PM2_SETUP.md, etc.

# 6. Update ecosystem.config.js paths if needed
nano ecosystem.config.js
# Update: interpreter and cwd paths

# 7. Restart PM2 with new config
pm2 stop websocket-service
pm2 delete websocket-service
pm2 start ecosystem.config.js
pm2 save
```

## Verify Your Repository Structure

To confirm this is a monorepo, check:

```bash
cd /path/to/sakura
ls -la
# Should see:
# - sakura-websocket-service/
# - sakura-backend-clean/
# - dashboard/
# - .git/  (at root level)
# - .gitignore  (at root level)
```

If `.git/` is at the root level, it's a monorepo - pull from root.

If `.git/` is inside `sakura-websocket-service/`, then it's a separate repo - pull from there.

## Quick Reference

```bash
# Always pull from root
cd /home/ec2-user/sakura
git pull origin main

# Then navigate to specific service
cd sakura-websocket-service
# Make your changes, restart services, etc.
```

