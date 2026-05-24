# 💕 我们的小屋 · Our Little Home

> 一个属于你们两个人的秘密花园 · A secret garden just for two

用 **Next.js 14** 构建的情侣私密 Web 应用，**马卡龙撞色 + 液态玻璃质感**，支持 **中英双语**、**响应式设计**，可 **Docker 私有化部署**，两人 **实时云端同步**。

---

## ✨ 功能一览

| 模块 | 说明 |
|------|------|
| ⏱️ **首页** | 在一起时间计数、数据统计、纪念日倒计时、情话、想 TA |
| 📸 **相册** | 上传照片 · 4 种视图 · 加文字和地点 |
| 📖 **日记** | 公开 / 私密 / 时间胶囊 · 心情打分 |
| 💬 **悄悄话** | 即时消息 · 漂流瓶 · 戳/抱/亲/摸头互动 |
| 🎂 **纪念日** | 多个纪念日 · 自动倒计时 · 临近推送提醒 |
| ✅ **心愿清单** | 100 件想做的事 · 5 分类 · 进度可视化 |
| 🗺️ **恋爱地图** | 去过 / 想去的地方 |
| 😊 **心情日历** | 双方每天打卡 · 月历可视化 |
| 😤 **吐槽墙** | 吐槽 · 锤 · AI 道歉 |
| ✨ **趣味游戏** | AI 情话 · 暗号解锁 · 涂鸦板 |
| ⚙️ **设置** | 称呼 · 主题 · 语言 · 通知 · **数据导出/导入** |

---

## 🚀 快速开始

### 本地开发（Windows 一键）

```powershell
.\start.ps1
# 浏览器打开 http://localhost:1314
```

> 端口 **1314**（一生一世）。首次运行会自动安装依赖、初始化数据库、生成 `.env`。

### 手动启动

```bash
cp .env.example .env   # 编辑 JWT_SECRET 等
npm install
npx prisma migrate deploy
npm run dev            # http://localhost:1314
```

---

## 👫 使用流程

1. **第一人** 访问 `/register` 注册 → 创建情侣空间 → 获得 **6 位邀请码**
2. **第二人** 访问 `/join` 输入邀请码加入
3. 两人在 **设置页** 配置称呼、在一起日期、城市、暗号、通知
4. 开始记录你们的甜蜜日常 💕

数据存储在 **服务端 SQLite + 文件系统**，两人 **实时同步**（SSE + 轮询兜底）。

---

## 🔔 通知配置

- **浏览器通知**：设置页开启权限，应用在后台时会弹窗
- **微信推送（Server酱）**：设置页填入 [Server酱](https://sct.ftqq.com/) SendKey
- **纪念日提醒**：当天 / 前 1 天 / 前 7 天自动推送（服务端定时检查）

---

## 🐳 生产部署

| 需求 | 方案 | 文档 |
|------|------|------|
| 国内/香港自建、要私密 | Docker + Caddy + 轻量服务器 | [DEPLOY.md](./DEPLOY.md) / [DEPLOY-CN.md](./DEPLOY-CN.md) |

```bash
cp .env.production.example .env
# 填写 DOMAIN、ACME_EMAIL、JWT_SECRET、CRON_SECRET
docker compose up -d --build
```

> **不推荐 Vercel 部署**：当前架构使用 SQLite 文件数据库 + 本地图片存储，与 Serverless 无状态环境不兼容。请使用 Docker 自托管。

### 纪念日定时任务（可选）

应用启动后会每 6 小时自动检查。如需更精确，可添加 crontab：

```bash
0 8 * * * curl -s -H "x-cron-secret: YOUR_CRON_SECRET" https://your-domain/api/cron/anniversaries
```

---

## 💾 数据备份

设置页 → **导出全部数据** → 下载 `.json` 文件，建议定期存到云盘。

也可通过 **导入数据** 从备份恢复（追加模式，不删除现有内容）。

---

## 🛠️ 技术栈

- **框架**：Next.js 14（App Router）+ TypeScript
- **UI**：Tailwind CSS + Framer Motion + Lucide
- **数据库**：Prisma + SQLite（可升级 PostgreSQL）
- **认证**：JWT + HttpOnly Cookie + bcrypt
- **实时同步**：SSE + 内存事件总线
- **图片**：Sharp 转 WebP
- **AI**：OpenAI 兼容接口（DeepSeek / 通义 / 智谱等，可选）
- **部署**：Docker standalone + Caddy HTTPS

---

## 📁 项目结构

```
src/
├── app/              # 页面 + API 路由
├── components/       # UI 组件
├── i18n/             # 中英双语
└── lib/              # auth, storage, notify, ai...
prisma/               # 数据库模型与迁移
deploy/               # 部署脚本
```

---

## 💡 常见问题

**Q：TA 看不到我新加的内容？**  
A：确认 TA 已用邀请码加入同一空间，且两人都保持登录。同步通过 SSE 实时推送。

**Q：照片存在哪里？**  
A：服务端 `uploads/` 目录（Docker 部署时在 `/data/uploads` 持久化卷）。

**Q：如何接入 AI？**  
A：在 `.env` 设置 `AI_PROVIDER` 和 `AI_API_KEY`，推荐 DeepSeek 或通义千问。

**Q：能改主题颜色吗？**  
A：编辑 `tailwind.config.ts` 中的 `macaron` 色板。

---

## License

MIT — 自由使用、修改、再创作。
