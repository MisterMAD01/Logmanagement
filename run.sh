#!/bin/bash
# ===============================
# Logmanagement Docker Runner
# ===============================
# Usage: ./run.sh [dev|saas]
# If no argument is provided, default to dev

MODE=$1

# -------------------------------
# 1. Set environment variables
# -------------------------------
if [ "$MODE" == "saas" ]; then
  echo "🚀 Starting SaaS Mode (Production)..."
  export MODE_SAAS=1
  export MODE_APPLIANCE_PORTS=""  # ไม่เปิด port สำหรับ local appliance
  export NODE_ENV=production
  export MODE_APPLIANCE_COMMAND="node server.js"
elif [ "$MODE" == "dev" ] || [ -z "$MODE" ]; then
  echo "🛠 Starting Appliance Mode (Dev/Local)..."
  export MODE_SAAS=0
  export MODE_APPLIANCE_PORTS=1     # เปิด port สำหรับ local
  export NODE_ENV=development
  export MODE_APPLIANCE_COMMAND="npx nodemon -L server.js"  # ใช้ nodemon สำหรับ live reload
else
  echo "❌ Unknown mode: $MODE"
  echo "Usage: ./run.sh [dev|saas]"
  exit 1
fi

# -------------------------------
# 2. Build and start Docker containers
# -------------------------------
docker compose up -d --build

# -------------------------------
# 3. Show container status
# -------------------------------
docker compose ps

# -------------------------------
# 4. Optionally, attach to backend logs
# Uncomment the next line if you want live logs
# docker compose logs -f backend
