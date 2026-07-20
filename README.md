# Wang's Notebook

一个基于 Cloudflare Pages + D1 的极简个人博客系统。

> 技术栈：纯静态前端 + Cloudflare Pages Functions + D1 (SQLite) + JWT 鉴权

## ✨ 特性

- 🎨 **极简现代设计** — 大留白、衬线/无衬线混排、深空蓝配色
- 🌙 **暗色模式** — 一键切换，跟随系统
- 📱 **响应式布局** — 完美适配移动端
- 📝 **文章系统** — 分类（技术/生活/资源）、标签、分页
- 💬 **评论系统** — 注册登录后可发表评论
- 👤 **用户系统** — 注册/登录，JWT 鉴权，PBKDF2 密码哈希
- 📦 **资源分享** — 网盘链接分享区，支持分类
- ⚡ **极致性能** — 纯静态 + 边缘计算，全球 CDN
- 💰 **几乎零成本** — Cloudflare 免费额度足够个人使用

## 📁 项目结构

```
.
├── public/                  # 静态站点文件
│   ├── index.html          # 首页
│   ├── posts.html          # 文章列表
│   ├── post.html           # 文章详情
│   ├── resources.html      # 资源分享
│   ├── about.html          # 关于页
│   ├── login.html          # 登录页
│   ├── register.html       # 注册页
│   ├── css/
│   │   └── style.css       # 主样式
│   └── js/
│       └── main.js         # 前端逻辑
├── functions/              # Cloudflare Pages Functions (API)
│   ├── _utils/             # 工具函数
│   │   ├── jwt.js          # JWT 签发与验证
│   │   ├── password.js     # PBKDF2 密码哈希
│   │   └── response.js     # HTTP 响应辅助
│   └── api/
│       ├── auth/
│       │   ├── register.js # POST /api/auth/register
│       │   └── login.js    # POST /api/auth/login
│       ├── posts.js        # GET /api/posts
│       ├── posts/
│       │   └── [slug].js   # GET /api/posts/:slug
│       ├── comments.js     # GET/POST /api/comments
│       └── resources.js    # GET /api/resources
├── migrations/
│   └── 0001_init.sql       # 数据库初始化脚本
├── wrangler.toml           # Wrangler 配置
└── README.md               # 本文件
```

## 🚀 快速开始

### 前置准备

1. 注册 [Cloudflare](https://dash.cloudflare.com/) 账号
2. 安装 Node.js 18+ 和 npm
3. 安装 wrangler CLI：
   ```bash
   npm install -g wrangler
   ```

### 1. 克隆项目

```bash
# 解压项目包
unzip wangs-notebook.zip
cd wangs-notebook
```

### 2. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create wangs-notebook-db
```

执行后会输出 database_id，复制下来。

### 3. 配置 wrangler.toml

编辑 `wrangler.toml`，填入你的 database_id：

```toml
[[d1_databases]]
binding = "DB"
database_name = "wangs-notebook-db"
database_id = "你的-database-id"  # 替换为上一步的输出
```

### 4. 初始化数据库

```bash
# 执行迁移（远程数据库）
wrangler d1 execute wangs-notebook-db --file=./migrations/0001_init.sql
```

### 5. 设置 JWT 密钥

```bash
# 设置 JWT 签名密钥（生产环境必须设置）
wrangler pages secret put JWT_SECRET
# 输入一个足够长的随机字符串作为密钥
```

> 💡 本地开发时默认使用 `dev-secret-change-me`，生产环境务必修改。

### 6. 本地开发

```bash
# 启动本地开发服务器（带 D1 绑定）
wrangler pages dev public --d1=wangs-notebook-db
```

访问 http://localhost:8788 即可预览。

### 7. 部署到 Cloudflare Pages

```bash
# 首次部署（会引导创建 Pages 项目）
wrangler pages deploy public --project-name=wangs-notebook
```

后续部署：
```bash
wrangler pages deploy public
```

部署成功后，会获得一个 `*.pages.dev` 的域名。

## 🌐 设置自定义域名

1. 进入 Cloudflare Dashboard → Workers & Pages → 你的 Pages 项目
2. 点击 "Custom domains" → "Set up a custom domain"
3. 输入你的域名（如 `blog.example.com`）
4. 按照提示配置 DNS 记录（如果域名在 Cloudflare 上会自动配置）
5. 等待 SSL 证书签发（通常几分钟）

## 📋 API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |

### 文章

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 文章列表（支持 `page`/`limit`/`category` 参数） |
| GET | `/api/posts/:slug` | 文章详情 |

### 评论

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/comments?post_id=X` | 获取文章评论 |
| POST | `/api/comments` | 发表评论（需登录） |

### 资源

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/resources` | 资源列表（支持 `category` 参数） |

## 🎨 自定义

### 修改博客名称

1. 编辑 `wrangler.toml` 中的 `SITE_NAME`
2. 全局搜索 "Wang's Notebook" 替换为你的博客名

### 修改配色

编辑 `public/css/style.css` 中的 CSS 变量：

```css
:root {
    --accent-blue: #16213E;     /* 主色：深空蓝 */
    --accent-teal: #0F3460;     /* 辅助色：极光青 */
    --accent-aurora: #533483;   /* 强调色：极光紫 */
    --accent-highlight: #E94560; /* 高亮色：珊瑚红 */
}
```

### 添加文章

直接向 D1 数据库插入数据：

```bash
wrangler d1 execute wangs-notebook-db --command "
INSERT INTO posts (slug, title, excerpt, content, category, tags)
VALUES ('my-new-post', '我的新文章', '摘要', '正文内容（支持 Markdown）', 'tech', '标签1,标签2');
"
```

或者后续可以做一个管理后台（目前版本需要手动操作数据库）。

## 🔒 安全说明

- 密码使用 PBKDF2-SHA256 + 100,000 次迭代哈希（Cloudflare Workers 不支持原生 bcrypt）
- JWT 使用 HS256 算法签名，默认有效期 7 天
- 生产环境务必设置强 JWT_SECRET
- 建议定期备份 D1 数据库

## 📊 免费额度参考

Cloudflare 免费档：
- **Pages**: 无限请求、无限带宽（静态站点）
- **Functions**: 每天 10 万次请求
- **D1**: 每天 5 万次读取、1 万次写入、5 GB 存储
- **带宽**: 无限

个人博客完全够用。

## 🤝 常见问题

**Q: 为什么不用 Next.js / Hugo / WordPress？**
A: 我想要一个足够轻量、完全可控、部署简单的博客系统。纯静态 + Serverless API 的组合，既保持了静态站点的速度，又有动态功能。

**Q: 支持 Markdown 吗？**
A: 文章内容支持基础 Markdown 语法（标题、加粗、列表、代码块、引用、链接）。

**Q: 怎么管理文章？**
A: 当前版本需要直接操作 D1 数据库。后续可以考虑加一个简单的管理后台，或者用本地 Markdown 文件 + 构建时导入的方式。

**Q: 可以导入 WordPress 文章吗？**
A: 可以写一个脚本把 WordPress 的 XML 导出文件转换为 SQL 插入语句。

## 📄 License

MIT License - 随意使用，欢迎二次开发。
