#!/usr/bin/env bash
# 部署 / 更新脚本
# 在项目目录（/opt/love-diary）下执行：bash deploy/deploy.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

if [[ ! -f .env ]]; then
  err "缺少 .env 文件！"
  echo "  cp .env.production.example .env"
  echo "  vim .env  # 填好 DOMAIN 和 ACME_EMAIL"
  exit 1
fi

if [[ ! -f docker-compose.yml ]]; then
  err "请在项目根目录执行此脚本"
  exit 1
fi

log "拉取最新代码..."
git pull --ff-only 2>/dev/null || warn "不是 git 仓库，跳过 pull"

log "构建并启动容器..."
docker compose up -d --build

log "等待容器健康..."
sleep 6
docker compose ps

log "查看日志（Ctrl+C 退出）："
echo ""
docker compose logs -f --tail=30 caddy
