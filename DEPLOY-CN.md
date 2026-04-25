# 🇨🇳 国内云服务器部署超详细指南

> **这是一份写给完全不会代码、也没用过服务器的人的保姆级指南。**
> 按顺序抄命令就行，每一步都告诉你该点哪个按钮、打哪行字。
>
> 全流程：**买服务器 15 分钟 + 备案等 7-20 天 + 部署 30 分钟**

---

## 📋 整体路线图

```
   [1. 买域名]  ──── ¥10-30 ──→
   [2. 买服务器]  ── ¥99/年起 ──→ [3. ICP 备案] ─ 等 7-20 天 ──→
   [4. SSH 连服务器] → [5. 装 Docker] → [6. 传代码] → [7. 配 .env] →
   [8. 启动服务] → [9. 域名解析] → [10. 浏览器打开] → 完成 🎉
   [11. 配微信推送]（可选）
```

---

## 📖 目录

1. [💰 成本预算对比](#-成本预算对比)
2. [📌 第 1 步：买域名](#-第-1-步买域名)
3. [🖥 第 2 步：买云服务器](#-第-2-步买云服务器)
4. [📝 第 3 步：ICP 备案（最重要）](#-第-3-步icp-备案最重要)
5. [🔌 第 4 步：SSH 连接服务器](#-第-4-步ssh-连接服务器)
6. [🐳 第 5 步：初始化服务器](#-第-5-步初始化服务器)
7. [📤 第 6 步：上传代码](#-第-6-步上传代码)
8. [⚙️ 第 7 步：配置环境变量](#-第-7-步配置环境变量)
9. [🚀 第 8 步：启动服务](#-第-8-步启动服务)
10. [🌐 第 9 步：域名解析 + HTTPS](#-第-9-步域名解析--https)
11. [🧪 第 10 步：注册账号 + 邀请 TA](#-第-10-步注册账号--邀请-ta)
12. [📱 第 11 步：配置微信推送（推荐）](#-第-11-步配置微信推送)
13. [🛡 安全加固](#-安全加固)
14. [💾 备份和恢复](#-备份和恢复)
15. [❓ 常见问题排查](#-常见问题排查)

---

## 💰 成本预算对比

| 方案 | 国内服务器（备案）| 香港服务器（免备案）|
|---|---|---|
| **域名** | ¥10-30 首年 | ¥10-30 首年 |
| **服务器** | ¥99/年（2C2G/3M）| ¥288/年（2C2G/30M）|
| **是否备案** | ✅ 必须，等 7-20 天 | ❌ 不需要 |
| **访问速度** | 国内 5-30ms ⚡ | 国内 30-80ms |
| **一年总价** | **¥109-129** | **¥298-318** |
| **每月约** | **¥10** | **¥25** |

> 💡 如果你**不想等备案**，直接用香港服务器（参考 `DEPLOY.md` 方案 B）。
>
> 本文讲**国内服务器**完整流程。

---

## 📌 第 1 步：买域名

### 去哪买？

推荐两家（都是国内正规商家）：
- **阿里云万网**：https://wanwang.aliyun.com/
- **腾讯云域名**：https://dnspod.cloud.tencent.com/

> 重要：**域名要和服务器在同一个厂商**备案更简单。比如买腾讯云服务器就在腾讯云买域名。

### 买什么域名？

推荐这些便宜又好看的后缀（按价格排序）：

| 后缀 | 首年价格 | 续费价格 | 特点 |
|---|---|---|---|
| `.top` | ¥1-9 | ¥39 | 最便宜首年 |
| `.xyz` | ¥6-20 | ¥79 | 年轻感 |
| `.icu` | ¥6-25 | ¥79 | 个人站常用 |
| `.cn` | ¥23 | ¥35 | 国内最正式，续费便宜 |
| `.com` | ¥55 | ¥79 | 最经典 |

> 💡 **推荐选 `.cn`**：备案最顺利，续费便宜（¥35/年），长期划算。

### 操作步骤（以腾讯云为例）

1. 打开 https://dnspod.cloud.tencent.com/
2. 右上角 → 注册 / 登录
3. 搜索你想要的域名，比如 `woaini2026` → 看哪些后缀空着
4. 选 `.cn` 或 `.top` 加入购物车
5. 结算付款
6. **域名实名认证**（必须做）：
   - 进入 控制台 → 我的域名 → 实名认证
   - 上传身份证正反面
   - 手机号验证
   - 等 1-3 天审核通过

---

## 🖥 第 2 步：买云服务器

### 推荐配置

| 等级 | 配置 | 价格（新用户）| 够用程度 |
|---|---|---|---|
| **最低** | 2核 2G / 3M带宽 / 50G SSD | **¥99/年** | ✅ 完全够 |
| 推荐 | 2核 4G / 5M带宽 / 80G SSD | ¥199/年 | 🚀 更流畅 |
| 奢华 | 4核 8G / 10M带宽 | ¥500+/年 | 没必要 |

### 去哪买？

两家都行，新用户首年都有大幅优惠：
- **阿里云轻量应用服务器**：https://www.aliyun.com/product/swas （搜 "轻量"）
- **腾讯云轻量应用服务器**：https://cloud.tencent.com/product/lighthouse

> 💡 如果域名买在哪家，服务器也在哪家，**备案流程最省心**。

### 操作步骤（以腾讯云为例）

1. 打开 https://cloud.tencent.com/product/lighthouse
2. 点 "立即选购"
3. **地域**：选离你和 TA 都近的（比如都在南方就选 "广州"，北方选 "北京"）
4. **镜像**：选 **Ubuntu Server 22.04 LTS**（不要选 CentOS 已停更）
5. **套餐**：**2核2G / 3M带宽 / 50G SSD** 最便宜的即可
6. **购买时长**：新用户选 **1 年**（有新用户价）
7. 支付
8. **实名认证**（如果还没做过）：上传身份证
9. 等 1-2 分钟服务器创建完成

### 获取登录信息

1. 进腾讯云 → 控制台 → 轻量应用服务器
2. 找到刚买的服务器，复制：
   - **公网 IP**（类似 `47.75.123.45`）→ 保存好
   - 系统：**Ubuntu 22.04**
3. 右侧 "更多" → **重置密码**（设一个你记得的 root 密码）

---

## 📝 第 3 步：ICP 备案（最重要）

### 为什么要备案？

国内法律规定：**任何在中国大陆机房提供网站服务的域名都必须 ICP 备案**。没备案的话：
- 80/443 端口会被运营商屏蔽
- 只能用非标准端口（比如 `http://xxx.com:8080`）很不方便

### 备案需要什么？

- 身份证原件（拍照）
- 手机号（备案会多次打电话核验，请保持畅通）
- 域名（已经实名认证过 1 天以上）
- 服务器（云服务商的，买完就行）
- 一张**纯色背景的人像照片**（备案后期要拍照）

### 备案在哪里做？

**在你买服务器的云服务商备案系统里做**。比如：
- 阿里云备案：https://beian.aliyun.com/
- 腾讯云备案：https://console.cloud.tencent.com/beian

### 备案时间线（大约）

```
第  1 天：提交资料 + 上传证件照
第  2 天：云服务商初审（阿里/腾讯审核，通常 1 天）
第  3 天：短信 / 电话核验（人工联系你）
第 3-5 天：提交到工信部（等 3-20 天）
第 5-20 天：备案号下来 → 成功！
```

备案期间**服务器和域名都可以先用**（用 IP 访问），只是 80/443 暂时不通。

### 详细操作（以腾讯云为例）

1. 打开 https://console.cloud.tencent.com/beian
2. 点 "开始备案" → 填域名（比如 `woaini2026.cn`）
3. 选 "云服务器" → 选择你买的那台
4. 填主办者信息：
   - **主办单位性质**：个人
   - **真实姓名**：身份证上的名字
   - **身份证号**：对的
   - **手机/邮箱**：真实
5. 填网站信息：
   - **网站名称**：个人日记 / 个人博客（**不要**写"我和老婆的小屋"等，会被驳回）
   - **网站内容**：选 **个人主页** 或 **博客**
6. 上传材料：
   - 身份证正反面
   - 人像照片（腾讯云有小程序辅助拍）
7. 提交等审核
8. 云服务商 1-2 天内会给你打电话核验：**告诉客服你是做个人博客**，简单回答就行
9. 工信部审核：3-20 天（短信通知）
10. **收到 ICP 备案号**（比如 `粤ICP备20260001号`）→ 备案成功！

备案成功后，把备案号写到网站底部（法律要求，后续我帮你加）。

> 🆘 备案被驳回？大概率是：
> - 姓名和身份证不一致
> - 网站名字涉及"商业"字眼
> - 手机号拨打没人接
> - 照片背景不是纯色
>
> 改好重新提交即可，不影响进度。

---

## 🔌 第 4 步：SSH 连接服务器

### Windows 用户

1. 按 `Win + R`，输入 `powershell`，回车
2. 输入命令（把 IP 换成你的）：

   ```powershell
   ssh root@47.75.123.45
   ```

3. 第一次会问 `Are you sure you want to continue connecting?` → 输入 `yes` 回车
4. 输入你之前设的密码（**输密码时屏幕不显示任何字符是正常的**）
5. 看到类似 `root@VM-0-xxx:~#` 就登录成功了 🎉

### Mac 用户

打开"终端"（Terminal），同样输 `ssh root@你的IP`。

---

## 🐳 第 5 步：初始化服务器

### 一键安装脚本

把下面**整段**复制粘贴到服务器窗口里（鼠标右键粘贴），回车执行：

```bash
# 1. 更新系统
apt-get update -y && apt-get upgrade -y

# 2. 基础工具
apt-get install -y curl wget git ufw unzip htop

# 3. 安装 Docker（官方脚本，国内网络几分钟装完）
curl -fsSL https://get.docker.com | bash
systemctl enable docker && systemctl start docker

# 4. 防火墙：只开放 22(SSH)、80(HTTP)、443(HTTPS)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
echo "y" | ufw enable
ufw status

# 5. 创建项目目录
mkdir -p /opt/love-diary
echo "✓ 初始化完成！"
```

> 这一步大约 2-5 分钟。如果安装 Docker 很慢，可以用国内源：
> ```bash
> curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
> ```

### 除了云服务商的防火墙，还要在**腾讯云控制台**开端口

1. 腾讯云控制台 → 轻量应用服务器 → 你的实例
2. 左侧 "防火墙"
3. 添加规则：
   - 应用类型：**HTTP (80)**
   - 应用类型：**HTTPS (443)**
   - （SSH 22 默认已开）
4. 保存

---

## 📤 第 6 步：上传代码

两种方式任选其一。

### 方式 A：用 Git（推荐，以后更新方便）

前提：代码已上传到 GitHub/Gitee 私有仓库。

```bash
cd /opt/love-diary
git clone https://github.com/你的用户名/your-repo.git .
# 注意命令末尾的 "." 表示克隆到当前目录
ls  # 应该看到 Dockerfile / src / prisma 等
```

> 如果 GitHub 访问慢，可以用 **Gitee** 镜像：https://gitee.com 免费私有仓库。

### 方式 B：从本地 Windows 上传

在你**本地**（Windows PowerShell）：

```powershell
cd H:\Test

# 打包需要的文件（排除大的/不需要的）
Compress-Archive -Path package.json,package-lock.json,tsconfig.json,next.config.mjs,postcss.config.mjs,tailwind.config.ts,Dockerfile,.dockerignore,docker-compose.yml,Caddyfile,.env.production.example,prisma,src,public -DestinationPath love-diary.zip -Force

# 上传到服务器（把 IP 换成你的）
scp love-diary.zip root@47.75.123.45:/opt/love-diary/
```

回到服务器：

```bash
cd /opt/love-diary
apt install -y unzip
unzip love-diary.zip
rm love-diary.zip
ls
```

---

## ⚙️ 第 7 步：配置环境变量

```bash
cd /opt/love-diary
cp .env.production.example .env

# 自动生成 JWT_SECRET（32 字节随机字符串）
JWT_SECRET=$(openssl rand -hex 32)
echo "你的 JWT_SECRET = $JWT_SECRET"
```

编辑 .env：

```bash
vim .env
```

操作：
1. 按 `i` 进入编辑模式
2. 改成下面这样（替换成你自己的值）：

   ```bash
   DOMAIN=woaini2026.cn
   ACME_EMAIL=your-email@qq.com
   JWT_SECRET=刚才生成的那一长串十六进制
   
   # 可选：AI 配置（留空则用本地情话模板）
   # 推荐 DeepSeek（便宜）或智谱 GLM-4-Flash（免费）
   AI_PROVIDER=deepseek
   AI_API_KEY=sk-你在 https://platform.deepseek.com 申请的 key
   ```

3. 按 `Esc`
4. 输入 `:wq` 再回车保存退出

---

## 🚀 第 8 步：启动服务

```bash
cd /opt/love-diary

# 一键构建 + 启动（第一次 5-10 分钟）
docker compose up -d --build
```

等待进度条跑完。跑完后查看状态：

```bash
docker compose ps
```

你应该看到类似：

```
NAME          STATUS              PORTS
love-caddy    Up (healthy)        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
love-web      Up (healthy)        3000/tcp
```

看实时日志：

```bash
docker compose logs -f
```

看到 `certificate obtained successfully` 就代表 HTTPS 自动配好了（按 `Ctrl+C` 退出）。

---

## 🌐 第 9 步：域名解析 + HTTPS

### 添加解析记录

1. 去你的域名控制台（腾讯云 DNSPod / 阿里云云解析）
2. 选中你的域名 → "解析"
3. 添加记录：

   | 记录类型 | 主机记录 | 记录值 | TTL |
   |---|---|---|---|
   | A | @ | 你服务器的公网 IP | 600 |
   | A | www | 你服务器的公网 IP | 600 |

4. 保存，等 5-10 分钟生效

### 验证解析

在**本地 Windows** PowerShell：

```powershell
ping woaini2026.cn
```

应该返回你服务器的 IP，就表示解析成功了。

### 打开浏览器

访问 `https://你的域名`，应该看到登录页。如果证书还在颁发中（第一次可能需要 1-2 分钟），刷新几次即可。

> 第一次如果报 "证书错误"，等 1 分钟刷新，或者 `docker compose logs caddy | grep certificate` 看证书申请日志。

---

## 🧪 第 10 步：注册账号 + 邀请 TA

### 你先注册

1. 访问 `https://你的域名`，会自动跳到登录页
2. 点 **"创建一个 →"**
3. 填：
   - 你的昵称：比如 "小狮子"
   - 邮箱：任意有效邮箱（不用真实接收邮件）
   - 密码：至少 6 位
   - 在一起的日期：你们在一起那天
   - 你的城市 / TA 的城市
4. 点 "创建小屋"
5. ⭐ 会显示一个 **6 位邀请码**（如 `VGUC9A`），截图保存给 TA

### 邀请 TA

1. 把邀请码和网址发给 TA
2. TA 访问 `https://你的域名` → 点 **"用邀请码加入 →"**
3. TA 填：邀请码 + 自己的邮箱 + 密码 + 昵称
4. 点 "进入我们的小屋"
5. 完成！现在两个人共享同一个小屋 🎉

### 验证同步

- 你这边发一条消息，TA 那边**几乎立刻**就能看到（SSE 实时同步）
- 上传照片、写日记、吐槽……都会秒级同步

---

## 📱 第 11 步：配置微信推送

> 不配置这一步你也能收到通知（网页内通知），但是配了以后会直接**推送到你的微信**，体验好一百倍。

### 为什么用 Server酱？

- ✅ 免费（个人用量完全够）
- ✅ 不需要公众号认证
- ✅ 推送到微信"方糖"公众号
- ✅ 手机一响就看到

### 操作步骤

#### 1. 注册 Server酱

1. 打开 https://sct.ftqq.com/
2. 点右上角 "登入" → **用微信扫码登录**
3. 左侧菜单 "SendKey" → 复制那一长串 `SCT...` 或 `SCU...`

#### 2. 关注微信公众号

按照页面提示，关注 **方糖服务号** 微信公众号（不关注的话推送不到）。

#### 3. 在你的小屋里填 SendKey

1. 登录 `https://你的域名`
2. 左下角 "设置"
3. 滚到 "消息提醒" 区
4. 粘贴 SendKey → 点 "保存"
5. 点 "发送测试通知到微信"
6. **如果微信立刻收到 "我们的小屋 · 测试通知" → 配置成功** ✅

#### 4. TA 也要做一遍

让 TA 也按上面步骤配自己的 SendKey。这样当你给 TA 发消息/吐槽/锤 TA 时，TA 微信就会收到。

### 能收到哪些通知？

在设置页可以勾选：

- 💬 对方发消息
- 😤 对方吐槽
- 🔨 被锤子锤
- 🥺 对方道歉
- 📖 对方写了新日记
- 📷 对方上传照片
- 🎂 纪念日临近

---

## 🛡 安全加固

做完下面这些操作后，服务器基本就稳了。

### A. 换 SSH 端口 + 禁用密码登录

```bash
# 编辑 SSH 配置
vim /etc/ssh/sshd_config
```

找到并修改（去掉 `#`）：
```
Port 22022                     # 改个非 22 的端口，防扫描
PasswordAuthentication no      # 禁用密码登录（需要先配好密钥！）
PermitRootLogin prohibit-password
```

> ⚠️ 在禁用密码前，**先配好 SSH 密钥登录**，不然你自己也进不来。

配 SSH 密钥（在**本地** PowerShell）：

```powershell
# 1. 生成密钥对（如果没有）
ssh-keygen -t ed25519 -C "your-email@example.com"
# 一路回车

# 2. 把公钥复制到服务器
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@你的IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

然后在服务器上开放新端口并重启 SSH：

```bash
ufw allow 22022/tcp
ufw delete allow 22/tcp
systemctl restart sshd
```

以后本地连接用：
```powershell
ssh -p 22022 root@你的IP
```

### B. 自动安装系统安全更新

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
# 选 <Yes>
```

### C. 加密码保护网站（可选）

如果你担心有人猜到网址偷看（虽然要登录才能看数据，但密码门能挡一层）：

```bash
# 生成密码哈希
docker run --rm caddy:2-alpine caddy hash-password
# 输入你想要的密码，回车两次
# 复制输出的哈希值
```

编辑 Caddyfile：
```bash
vim /opt/love-diary/Caddyfile
```

找到注释掉的 `basic_auth` 块，去掉 `#`，替换成你的用户名和哈希。

重启：
```bash
cd /opt/love-diary
docker compose restart caddy
```

---

## 💾 备份和恢复

### 自动每日备份

```bash
# 创建备份脚本
cat > /root/backup-love.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/var/backups
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker run --rm \
  -v love-diary_love-data:/data:ro \
  -v $BACKUP_DIR:/backup \
  alpine tar -czf "/backup/love-$DATE.tar.gz" -C /data .
# 只保留 30 天
find $BACKUP_DIR -name "love-*.tar.gz" -mtime +30 -delete
echo "备份完成：$BACKUP_DIR/love-$DATE.tar.gz"
EOF
chmod +x /root/backup-love.sh

# 测试运行
bash /root/backup-love.sh
ls -lh /var/backups/

# 加到 cron（每天凌晨 3 点）
(crontab -l 2>/dev/null; echo "0 3 * * * bash /root/backup-love.sh") | crontab -
```

### 同步备份到云盘（推荐）

用 rclone 同步到阿里云盘 / 百度网盘 / OneDrive：

```bash
# 安装 rclone
curl https://rclone.org/install.sh | sudo bash

# 配置云盘（按提示操作）
rclone config

# 测试上传
rclone copy /var/backups/ mycloud:love-backups/
```

### 手动恢复数据

如果某天数据出问题：

```bash
cd /opt/love-diary
docker compose down

# 恢复备份
docker run --rm \
  -v love-diary_love-data:/data \
  -v /var/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar -xzf /backup/love-20260501_030000.tar.gz -C /data"

docker compose up -d
```

---

## ❓ 常见问题排查

### Q1：`docker compose up` 报网络错误

国内拉 Docker 镜像慢，配个镜像加速器：

```bash
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
systemctl daemon-reload
systemctl restart docker

# 重试
cd /opt/love-diary
docker compose up -d --build
```

### Q2：浏览器显示 "无法访问此网站"

按顺序检查：

```bash
# 1. 容器是否在运行
docker compose ps  # 应该都是 Up

# 2. 80/443 端口是否开了
ss -tlnp | grep -E ":80|:443"

# 3. 云服务商防火墙是否开了（腾讯云/阿里云控制台 → 防火墙）

# 4. ufw 是否开了
ufw status

# 5. 域名是否解析到这台服务器
dig +short woaini2026.cn
```

### Q3：HTTPS 证书申请失败

```bash
docker compose logs caddy | grep -i "error\|certificate"
```

常见原因：
- **域名没备案**：被运营商屏蔽 80 端口 → 必须先备案
- **域名解析没生效**：等 10-30 分钟
- **防火墙挡了 80**：检查 ufw 和云服务商控制台

### Q4：消息不能实时同步

```bash
# 看 SSE 连接日志
docker compose logs web | grep events
```

如果发现 SSE 被断开，大概率是 Caddy/Nginx 反代时没配"不要缓冲"。
本项目的 Caddyfile 已经带了 `X-Accel-Buffering: no`，应该没问题。

### Q5：Server酱 推送失败

1. 检查 SendKey 是否正确（去 https://sct.ftqq.com/sendkey 看）
2. 检查是否关注了 "方糖服务号" 微信公众号
3. 免费版每天只能推 5 条，超了会限流
4. `docker compose logs web | grep "ServerChan"` 看日志

### Q6：想加更多功能

这个网站所有代码都在你服务器上，你完全掌控。让 AI 帮你改代码，然后：

```bash
cd /opt/love-diary
git pull  # 或者重新传代码
docker compose up -d --build
```

---

## 📝 成本总结

| 项目 | 金额 |
|---|---|
| 域名（`.cn` 首年） | ¥23 |
| 域名（次年起） | ¥35/年 |
| 服务器（2C2G 首年） | ¥99 |
| 服务器（次年起） | ¥200-400/年 |
| AI 费用（DeepSeek 月均）| ¥0-10 |
| Server酱（个人免费） | ¥0 |
| **首年总计** | **约 ¥130** |
| **次年起** | **约 ¥250-450** |

每天一杯豆浆的钱，换你们专属的小屋。💕

---

## ✅ 上线检查清单

- [ ] 买域名，已实名认证
- [ ] 买服务器（国内 2C2G 轻量）
- [ ] 提交 ICP 备案
- [ ] **等待备案通过（7-20 天）⏰**
- [ ] 备案通过后：SSH 连服务器
- [ ] 跑一键初始化脚本
- [ ] 上传项目代码
- [ ] 配置 .env（JWT_SECRET + AI Key）
- [ ] `docker compose up -d --build`
- [ ] 域名解析到服务器 IP
- [ ] 浏览器访问 https://你的域名
- [ ] 注册第一个账号 + 复制邀请码
- [ ] TA 用邀请码加入
- [ ] 配置 Server酱 微信推送
- [ ] TA 也配置 Server酱
- [ ] 测试实时消息同步
- [ ] 测试微信推送到位
- [ ] 加密码门 / 换 SSH 端口 / 配密钥登录
- [ ] cron 自动备份
- [ ] rclone 同步到云盘

完成所有 ✅ 后，恭喜你拥有了**全球仅此一家**的恋爱小屋 🏡💕
