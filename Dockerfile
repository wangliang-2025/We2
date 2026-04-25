# syntax=docker/dockerfile:1.6
# 多阶段构建 - 包含 Prisma + Sharp + 持久化卷支持

# ===== Stage 1: 安装依赖 =====
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm config set registry https://registry.npmmirror.com

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ===== Stage 2: 构建应用 =====
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# ===== Stage 3: 运行时 =====
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL=file:/data/db.sqlite
ENV UPLOAD_DIR=/data/uploads

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Prisma 二进制（运行时也需要 schema 用于 migrate deploy）
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/engines ./node_modules/@prisma/engines

# Standalone 应用
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 启动脚本
COPY --chown=nextjs:nodejs <<EOF /app/entrypoint.sh
#!/bin/sh
set -e
mkdir -p /data/uploads
echo "[OK] running prisma migrate deploy..."
node node_modules/prisma/build/index.js migrate deploy
echo "[OK] starting Next.js..."
exec node server.js
EOF
RUN chmod +x /app/entrypoint.sh

# 数据卷（数据库 + 图片）
VOLUME /data

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000 >/dev/null 2>&1 || exit 1

CMD ["/app/entrypoint.sh"]
