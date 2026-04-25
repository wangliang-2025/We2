#!/usr/bin/env bash
# Mac / Linux 一键启动脚本
# 用法：bash start.sh   或者   chmod +x start.sh && ./start.sh

set -e

PORT=1314
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

step() { echo -e "${CYAN}>> $1${NC}"; }
ok()   { echo -e "${GREEN}OK $1${NC}"; }
warn() { echo -e "${YELLOW}!! $1${NC}"; }
err()  { echo -e "${RED}XX $1${NC}"; }

cd "$(dirname "$0")"

echo ""
echo -e "${MAGENTA}=============================================${NC}"
echo -e "${MAGENTA}    我们的小屋 (Love Diary) 启动中...${NC}"
echo -e "${MAGENTA}=============================================${NC}"
echo ""

# 1. 检查 Node.js
if ! command -v node &>/dev/null; then
  err "没找到 Node.js！请先安装：https://nodejs.org"
  exit 1
fi
ok "Node.js $(node --version)"

# 2. .env
if [ ! -f .env ]; then
  step "首次启动：生成 .env 配置..."
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > .env <<EOF
DATABASE_URL="file:./dev.db"
JWT_SECRET="$SECRET"
UPLOAD_DIR="./uploads"

# AI 配置（留空就用本地情话模板；填了走真 AI）
AI_PROVIDER=""
AI_API_KEY=""
AI_BASE_URL=""
AI_MODEL=""
EOF
  ok ".env 已生成"
fi

# 3. 安装依赖
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  step "安装依赖（首次约 1-3 分钟）..."
  npm install --no-audit --no-fund --loglevel=error
  ok "依赖安装完成"
else
  ok "依赖已就绪"
fi

# 4. Prisma Client
if [ ! -d node_modules/.prisma/client ]; then
  step "生成 Prisma Client..."
  npx prisma generate >/dev/null 2>&1
  ok "Prisma Client 生成完成"
fi

# 5. 数据库
if [ ! -f prisma/dev.db ]; then
  step "首次启动：初始化数据库..."
  npx prisma migrate deploy >/dev/null 2>&1
  ok "数据库已就绪"
else
  npx prisma migrate deploy >/dev/null 2>&1 || true
fi

# 6. 释放端口
PIDS=$(lsof -ti tcp:$PORT 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  warn "端口 $PORT 已被占用，正在释放..."
  echo "$PIDS" | xargs kill -9 2>/dev/null || true
  sleep 2
  ok "端口已释放"
fi

# 7. 后台等服务起来后开浏览器
(
  for i in $(seq 1 30); do
    sleep 1
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" 2>/dev/null | grep -q 200; then
      if command -v open &>/dev/null; then open "http://localhost:$PORT"
      elif command -v xdg-open &>/dev/null; then xdg-open "http://localhost:$PORT"
      fi
      break
    fi
  done
) &

echo ""
echo -e "${MAGENTA}=============================================${NC}"
echo -e "  访问地址：${GREEN}http://localhost:$PORT${NC}"
echo "  浏览器会自动打开"
echo "  按 Ctrl + C 停止服务"
echo -e "${MAGENTA}=============================================${NC}"
echo ""

npm run dev
