# 🚀 部署上线指南

> 本指南给**完全不会代码**的人也能跟着走。
> 全程预计 30-90 分钟。

---

## 📑 目录

1. [⭐ 方案对比 + 推荐](#-方案对比)
2. [💸 方案 A：Cloudflare 全免费方案](#-方案-acloudflare-全免费)
3. [🏆 方案 B：香港服务器 Docker 部署（推荐）](#-方案-b香港服务器--docker推荐)
4. [💰 方案 C：国内服务器 + 备案（最便宜）](#-方案-c国内服务器--备案最便宜)
5. [🔧 必读：环境变量配置](#-必读环境变量配置)
6. [🤖 接入 AI 详细说明](#-接入-ai-详细说明)
7. [💾 备份和运维](#-备份和运维)

---

## ⭐ 方案对比

| 方案 | 月成本 | 备案 | 双人同步 | 图床 | 国内速度 | 难度 |
|---|---|---|---|---|---|---|
| **A. Cloudflare 全家桶** | **¥0** | ❌ | ✅ | ✅ R2 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **B. 香港轻量服务器**（推荐） | ¥24 | ❌ | ✅ | ✅ 本地 | ⭐⭐⭐ | ⭐⭐ |
| **C. 国内服务器 + 备案** | ¥8 | ✅（等 1-3 周）| ✅ | ✅ 本地 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **D. 自家电脑 + frp** | ¥0-30 | ❌ | ✅ | ✅ 本地 | 看家庭宽带 | ⭐⭐⭐⭐ |

### 🎯 我的推荐

- **想最快上线 + 不想折腾** → **方案 B**（香港服务器，¥24/月，今天就能用）
- **极致省钱 + 能接受偶尔慢** → **方案 A**（Cloudflare，0 元/月）
- **追求国内速度 + 长期使用** → **方案 C**（国内服务器，等备案后最快）

---

## 💸 方案 A：Cloudflare 全免费

> ⚠️ **重要说明**：当前代码用的是 SQLite + 本地文件系统，**直接部署到 Cloudflare 需要做一次代码适配**（Prisma → D1 driver、本地图床 → R2）。
>
> 这部分工作量约 1-2 天的代码改动。如果你需要这个，告诉我我来做。
>
> **如果你愿意每月花 ¥24 直接上线，请直接看方案 B**。

### 适配后的成本结构（参考）

| Cloudflare 服务 | 用途 | 免费额度 | 你会用到的 |
|---|---|---|---|
| Pages | 前端 + API | 无限 | ✅ |
| D1 | SQLite 数据库 | 5GB | 几 MB |
| R2 | 对象存储（图床）| 10GB | 几 GB |
| Workers AI | AI 推理 | 部分模型免费 | 可选 |

**月成本：¥0**（除非你的相册超过 10GB）

---

## 🏆 方案 B：香港服务器 + Docker（推荐）

### 第 0 步：准备工作

#### 0.1 买域名（约 ¥10-50/首年）

去阿里云万网/腾讯云域名，推荐便宜后缀 `.top` `.icu` `.xyz`（首年 ¥10-30）。

例：`woaini.top`、`xxx-and-yyy.com`

> 域名买完会要求实名认证，自动处理 1-3 天。

#### 0.2 买香港轻量服务器

| 推荐配置 | 价格 |
|---|---|
| 阿里云/腾讯云**香港轻量** 2C2G/30M带宽 | **¥288/年** ≈ ¥24/月 |

**镜像选择**：**Ubuntu 22.04 LTS**

> 💡 香港机房**不需要 ICP 备案**，买完立即可用。

#### 0.3 域名解析到服务器

去域名服务商的"域名解析"添加：

```
记录类型：A
主机记录：love（或 @ 或其他）
记录值：你服务器的公网 IP
TTL：默认
```

5-10 分钟生效。验证：在本地命令行 `ping love.your-domain.com` 应该返回服务器 IP。

---

### 第 1 步：连接服务器

Windows 用户：按 `Win + R`，输入 `powershell`，回车。

```powershell
ssh root@你的服务器IP
```

第一次会让你输 yes 和密码（云服务商控制台可以重置密码）。

---

### 第 2 步：服务器初始化（一键脚本）

```bash
# 下载并运行初始化脚本
curl -fsSL https://get.docker.com | bash  # 装 Docker
systemctl enable docker && systemctl start docker

# 防火墙
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
echo "y" | ufw enable

# 创建项目目录
mkdir -p /opt/love-diary && cd /opt/love-diary
```

---

### 第 3 步：上传代码

#### 选项 A：用 GitHub（推荐）

如果代码已经在 GitHub 私有仓库：

```bash
cd /opt/love-diary
git clone https://github.com/你的用户名/your-repo.git .
```

#### 选项 B：从本地 Windows 上传

在你**本地 Windows** PowerShell：

```powershell
cd H:\Test
# 排除 node_modules 和 .next 打包
Compress-Archive -Path package.json,package-lock.json,tsconfig.json,next.config.mjs,postcss.config.mjs,tailwind.config.ts,Dockerfile,.dockerignore,docker-compose.yml,Caddyfile,.env.production.example,prisma,src,public -DestinationPath love-diary.zip -Force
scp love-diary.zip root@你的服务器IP:/opt/love-diary/
```

回到服务器：

```bash
cd /opt/love-diary
apt install -y unzip
unzip love-diary.zip
rm love-diary.zip
ls   # 应该看到 Dockerfile docker-compose.yml prisma/ src/ 等
```

---

### 第 4 步：配置环境变量

```bash
cd /opt/love-diary
cp .env.production.example .env

# 生成 JWT_SECRET（32 字节随机字符串）
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
echo "JWT_SECRET 已生成：$JWT_SECRET"

# 编辑 .env
vim .env
```

按 `i` 进入编辑模式，至少改这三个：

```bash
DOMAIN=love.your-domain.com
ACME_EMAIL=your-email@example.com
JWT_SECRET=刚才生成的那一长串

# 可选：填了 AI 才有真正的 AI 情话/AI 道歉
AI_PROVIDER=deepseek
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

按 `Esc` → 输入 `:wq` 回车保存。

---

### 第 5 步：一键启动！

```bash
cd /opt/love-diary
docker compose up -d --build
```

第一次构建约 5-10 分钟（要装 Node、Prisma、Sharp、Caddy 等）。

启动后查看状态：

```bash
docker compose ps
docker compose logs -f
```

看到 `certificate obtained successfully` 说明 HTTPS 已配好（按 `Ctrl+C` 退出日志）。

---

### 第 6 步：打开浏览器！

访问 `https://你的域名`，会跳到登录页。

#### 第一次使用：

1. 点 **"创建一个 →"** 进入注册页
2. 填邮箱、密码、你的昵称、在一起的日期、城市
3. 注册成功后会显示一个 **6 位邀请码**（如 `VGUC9A`）
4. 复制邀请码发给 TA
5. TA 在登录页点 **"用邀请码加入 →"**，输入邀请码 + 自己的邮箱密码
6. 完成！现在两人共享同一个小屋了 🎉

---

## 💰 方案 C：国内服务器 + 备案（最便宜）

跟方案 B 几乎一样，区别：

| 项目 | 方案 B（香港） | 方案 C（国内） |
|---|---|---|
| 服务器价格 | ¥288/年 | **¥99/年** |
| 备案 | ❌ 不需要 | ✅ 需要（7-20 天）|
| 国内访问速度 | 30-80ms | 5-30ms（快得多）|

### 备案大致流程

1. 在阿里云/腾讯云的"备案系统"提交申请
2. 上传身份证 + 域名信息
3. 阿里云审核（1-2 天）
4. 提交到工信部 → 等待审批（7-20 天）
5. 收到备案号后，绑定到域名

备案后所有步骤跟方案 B 完全一样。

---

## 🔧 必读：环境变量配置

打开 `.env` 文件，里面所有变量的解释：

| 变量 | 必填？ | 说明 |
|---|---|---|
| `DOMAIN` | ✅ | 你的域名，比如 `love.example.com` |
| `ACME_EMAIL` | ✅ | 你的邮箱，用于 Let's Encrypt 证书提醒 |
| `JWT_SECRET` | ✅ | 32 字符以上随机字符串，**绝不能泄露** |
| `AI_PROVIDER` | ❌ | 留空就用本地情话模板；填了走真 AI |
| `AI_API_KEY` | ❌ | AI provider 的 API Key |
| `AI_BASE_URL` | ❌ | 自定义 AI 接口地址（可选）|
| `AI_MODEL` | ❌ | 自定义模型名（可选）|

### 生成 JWT_SECRET 的命令

```bash
# 方法 1（Linux/Mac）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2
openssl rand -hex 32

# 方法 3（在线，不推荐）
# 用什么都行，反正得 >=32 字符随机就行
```

---

## 🤖 接入 AI 详细说明

### 推荐 AI Provider（按性价比）

| Provider | 价格 | 注册地址 | 推荐指数 |
|---|---|---|---|
| **DeepSeek** | 极便宜（百万 token 1-2 元）| https://platform.deepseek.com | ⭐⭐⭐⭐⭐ |
| **通义千问 Qwen** | 有免费额度 | https://dashscope.aliyun.com | ⭐⭐⭐⭐⭐ |
| **智谱 GLM** | 便宜，glm-4-flash 免费 | https://open.bigmodel.cn | ⭐⭐⭐⭐ |
| **月之暗面 Kimi** | 有免费额度 | https://platform.moonshot.cn | ⭐⭐⭐⭐ |
| **OpenAI** | 贵 + 需要科学上网 | https://platform.openai.com | ⭐⭐ |

### 配置示例

#### 用 DeepSeek（推荐）

```bash
AI_PROVIDER=deepseek
AI_API_KEY=sk-你的key
# baseUrl 和 model 不用填，自动用默认值
```

#### 用阿里通义千问

```bash
AI_PROVIDER=qwen
AI_API_KEY=sk-你的key
```

#### 用智谱 GLM-4-Flash（免费）

```bash
AI_PROVIDER=zhipu
AI_API_KEY=你的key
AI_MODEL=glm-4-flash
```

#### 用任何 OpenAI 兼容的服务

```bash
AI_PROVIDER=custom
AI_API_KEY=你的key
AI_BASE_URL=https://your-custom-api.com/v1
AI_MODEL=your-model-name
```

### 改完后重启服务

```bash
cd /opt/love-diary
docker compose restart web
```

打开网站 → 首页"今日情话" 旁边出现紫色 **AI** 标签 = AI 已生效 ✅

---

## 💾 备份和运维

### 日常运维命令

```bash
cd /opt/love-diary

# 看运行状态
docker compose ps

# 看日志
docker compose logs -f --tail=100 web    # Next.js + Prisma
docker compose logs -f --tail=100 caddy  # HTTPS 证书

# 重启
docker compose restart

# 停止
docker compose down

# 启动
docker compose up -d

# 更新代码后重新部署
git pull && docker compose up -d --build
```

### 备份数据库 + 图片

数据都在 Docker volume `love-data` 里。每周备份一次：

```bash
# 创建备份
docker run --rm \
  -v love-diary_love-data:/data:ro \
  -v /var/backups:/backup \
  alpine tar -czf "/backup/love-data-$(date +%Y%m%d).tar.gz" -C /data .

# 自动每天凌晨 3 点备份（编辑 cron）
crontab -e
# 加一行：
0 3 * * * docker run --rm -v love-diary_love-data:/data:ro -v /var/backups:/backup alpine tar -czf "/backup/love-data-$(date +\%Y\%m\%d).tar.gz" -C /data . && find /var/backups -name "love-data-*.tar.gz" -mtime +30 -delete
```

### 把备份同步到云盘（建议）

```bash
# 安装 rclone
curl https://rclone.org/install.sh | sudo bash

# 配置（一次性，按提示选阿里云盘 / OneDrive / Google Drive 等）
rclone config

# 上传到云盘
rclone copy /var/backups/love-data-$(date +%Y%m%d).tar.gz mycloud:backups/
```

### 手动恢复数据

```bash
# 停服务
docker compose down

# 恢复备份
docker run --rm \
  -v love-diary_love-data:/data \
  -v /var/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar -xzf /backup/love-data-XXXXXX.tar.gz -C /data"

# 重启
docker compose up -d
```

---

## ❓ 常见问题

### Q: 我可以让 TA 在另一个城市/手机用吗？
✅ 完全可以！这就是云端同步的意义。把网址发给 TA + 邀请码即可。

### Q: 数据安全吗？
✅
- 数据库 + 图片**只在你自己服务器**，第三方看不到
- HTTPS 全程加密
- 密码用 bcrypt 加盐哈希
- JWT cookie httpOnly + sameSite，防 XSS/CSRF
- 图片访问需要登录 + 只能看自己 couple 的

### Q: 我换电脑/手机怎么办？
✅ 直接打开网址，登录就行。所有数据都在云端。

### Q: TA 走丢了/分手了，怎么删？
- 登录 → 设置 → 退出登录
- 想彻底删，可以 SSH 到服务器：
  ```bash
  docker compose down -v   # ⚠️ 这会删除所有数据
  ```

### Q: 邀请码忘了怎么办？
- 已经登录的用户：进【设置】页，里面有邀请码

### Q: AI 回答得不好/失败了？
- 检查 `AI_PROVIDER` 和 `AI_API_KEY` 是否正确
- `docker compose logs web | grep AI` 看日志
- 试试换个 provider（如从 OpenAI 换到 DeepSeek）

### Q: 图片传不上去？
- 看是不是超过 20MB（默认限制）
- 看磁盘空间：`df -h`
- 看上传目录权限：`docker compose exec web ls -la /data`

---

## 📝 上线清单

- [ ] 买域名
- [ ] 买香港轻量服务器（推荐 ¥288/年）
- [ ] 域名解析到服务器 IP
- [ ] SSH 连服务器
- [ ] 装 Docker + 防火墙
- [ ] 上传项目代码
- [ ] 生成 JWT_SECRET，配 .env
- [ ] （可选）申请 DeepSeek API Key 配置 AI
- [ ] `docker compose up -d --build`
- [ ] 浏览器访问注册账号
- [ ] 把邀请码发给 TA
- [ ] TA 用邀请码加入
- [ ] 设置 cron 自动备份

**总成本（方案 B）**：域名 ¥30 + 服务器 ¥288 = **¥318/年（约 ¥27/月）**
**总成本（方案 C）**：域名 ¥30 + 服务器 ¥99 = **¥129/年（约 ¥11/月）**

愿你们的小屋永远温暖。💕
