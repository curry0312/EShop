#!/bin/bash

echo "🛑 停止並刪除舊的 containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans

echo "🧹 清除未使用的 Docker images..."
docker image prune -f

echo "🔁 重新建構 containers（不使用快取）..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 啟動 containers 中..."
docker compose -f docker-compose.prod.yml up -d

echo "🌐 開啟瀏覽器前往網站..."
open http://localhost

echo "✅ 部署完成!"
