#!/usr/bin/env bash
# 服务器一键初始化脚本（Ubuntu 22.04 / Debian 12 测试通过）
# 在服务器上以 root 或 sudo 用户执行：
#   wget https://your-repo/setup-server.sh && bash setup-server.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
  err "请用 root 用户或加 sudo 执行"
  exit 1
fi

log "====== 1/6 更新系统 ======"
apt-get update -y && apt-get upgrade -y

log "====== 2/6 安装基础工具 ======"
apt-get install -y curl wget git ufw unzip htop ca-certificates

log "====== 3/6 安装 Docker ======"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker
  systemctl start docker
  log "Docker 安装完成"
else
  log "Docker 已存在，跳过"
fi

log "====== 4/6 配置防火墙（仅开放 22/80/443）======"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 443/udp comment 'HTTP/3'
echo "y" | ufw enable
ufw status verbose

log "====== 5/6 配置 SSH 安全（建议）======"
warn "请记得改 SSH 默认端口，禁用密码登录，使用密钥登录"
warn "  vim /etc/ssh/sshd_config -> Port 22  改成你喜欢的"
warn "  vim /etc/ssh/sshd_config -> PasswordAuthentication no"

log "====== 6/6 创建项目目录 ======"
mkdir -p /opt/love-diary
log "目录创建：/opt/love-diary"

echo ""
log "====== 服务器初始化完成！ ======"
echo ""
echo "下一步："
echo "  1) cd /opt/love-diary"
echo "  2) 把项目代码上传到这里（git clone 或 scp）"
echo "  3) 复制 .env.production.example 为 .env 并填好域名"
echo "  4) docker compose up -d --build"
echo ""
