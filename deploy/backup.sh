#!/usr/bin/env bash
# 服务端备份脚本（备份 Caddy 数据 + Docker 配置）
# 注意：用户的恋爱数据（照片/日记/聊天）存在浏览器 localStorage，需要在网页设置页里"导出数据"备份
# 这个脚本只备份服务器配置和 SSL 证书

set -e

BACKUP_DIR="/var/backups/love-diary"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"

cd "$(dirname "$0")/.."

echo "[OK] 打包 Caddy 数据 + 配置..."
tar -czf "${BACKUP_FILE}" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  Caddyfile \
  docker-compose.yml \
  .env 2>/dev/null || true

# 备份 Docker 卷（caddy_data 含 SSL 证书）
docker run --rm \
  -v love-diary_caddy_data:/source:ro \
  -v "${BACKUP_DIR}":/backup \
  alpine tar -czf "/backup/caddy_data_${TIMESTAMP}.tar.gz" -C /source . 2>/dev/null || true

# 只保留最近 14 天的备份
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +14 -delete

echo "[OK] 备份完成：${BACKUP_FILE}"
ls -lh "${BACKUP_DIR}"

echo ""
echo "===== 重要提醒 ====="
echo "用户的恋爱数据（照片/日记/吐槽/聊天）在浏览器本地，"
echo "请提醒每个人定期在【设置】页【导出全部数据】下载备份。"
