@echo off
title 🟢 Starting Logmanagement Stack
echo ⏳ Starting stack...
docker-compose up -d

echo.
echo 📋 Containers status:
docker ps
echo.

echo 📄 Opening logs in separate windows...
start cmd /k "title Backend Logs & docker logs -f backend"
start cmd /k "title Frontend Logs & docker logs -f frontend"
start cmd /k "title OpenSearch Logs & docker logs -f opensearch"

echo.
echo 🌐 Check ngrok dashboard at http://localhost:4040
echo 🔗 ngrok public URL will be displayed in ngrok logs window
echo.

echo Press any key to stop all containers.
pause

echo ⏹ Stopping containers...
docker-compose down

echo ✅ All containers stopped.
pause
