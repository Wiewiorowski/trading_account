---
description: How to manually rebuild and restart Docker containers
---

If you want to manually refresh your Docker environment, follow these steps in your terminal.

### 1. Setup Environment (Run this EVERY time you open a new terminal)
Copy and paste this **entire block** into PowerShell:

```powershell
# 1. Go to your project folder
cd "C:\Users\Piiio\Desktop\trading_account"

# 2. Add Docker to your temporary path
$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path
```

### 2. Stop and Remove Existing Containers
First, clear out the running containers to ensure a clean slate.
```powershell
docker compose down
```

### 3. (Optional) Remove Old Images
If you want to force a complete re-download/re-build of everything (e.g., if you changed dependencies):
```powershell
docker rmi trading_account-server trading_account-client
```

### 4. Rebuild and Start
This command does everything: builds the images based on your Dockerfiles and starts the containers.
- `--build`: Forces a rebuild of the images.
- `-d`: Runs in "detached" mode (background). Remove this if you want to see logs in your terminal.

```powershell
docker compose up -d --build
```

### 4. Viewing Logs
If you ran with `-d`, you can view logs for specific services:

**Server Logs:**
```powershell
docker compose logs -f server
```

**Client Logs:**
```powershell
docker compose logs -f client
```

### 5. Accessing the App
- Frontend: http://localhost:5173
- Backend Health: http://localhost:3000/health
