-- Wang's Notebook - D1 Database Initialization
-- SQLite / Cloudflare D1 compatible

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'tech', -- tech, life, resource
    tags TEXT, -- comma-separated
    cover_image TEXT,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    category TEXT,
    file_size TEXT,
    password TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

-- Insert sample posts
INSERT OR IGNORE INTO posts (slug, title, excerpt, content, category, tags, cover_image) VALUES
(
    'hello-ai-era',
    '我们正站在 AI 时代的入口',
    '从大语言模型到多模态，AI 正在以前所未有的速度重塑软件开发的每一个环节。',
    '# 我们正站在 AI 时代的入口

2026 年的今天，人工智能已经不再是实验室里的概念。它渗透到了我们工作和生活的方方面面。

## 软件开发的范式转移

传统的软件开发流程正在被彻底改写：

- **代码生成**：从手写每一行到描述需求，AI 帮你实现
- **代码审查**：AI 能够发现人类容易忽略的边界问题
- **测试自动化**：自动生成测试用例，覆盖率大幅提升
- **架构决策**：AI 辅助进行技术选型和架构设计

## 个人的思考

作为一名计算机专业的从业者，我时常在想：**我们该如何与 AI 共处？**

答案或许是——把 AI 当作一个能力极强的同事，而不是替代品。它能帮我们处理重复性工作，让我们有更多时间去思考真正重要的问题：产品设计、用户体验、系统架构……

> 工具的进化，从来都是为了让人更像人。

未来已来，只是分布不均。保持学习，保持好奇。',
    'tech',
    'AI,大语言模型,软件开发',
    'ai-era'
),
(
    'cloudflare-d1-guide',
    'Cloudflare D1 入门指南：免费的 Serverless 数据库',
    'D1 是 Cloudflare 推出的 Serverless SQLite 数据库，免费额度足够个人博客使用。本文带你从零搭建。',
    '# Cloudflare D1 入门指南

Cloudflare D1 是一个基于 SQLite 的 Serverless 数据库服务，与 Cloudflare Workers 和 Pages 深度集成。

## 为什么选择 D1？

1. **免费额度充足**：每天 5 万次读取、1 万次写入
2. **零运维**：不需要管理服务器，自动扩展
3. **边缘计算**：数据靠近用户，延迟更低
4. **SQLite 兼容**：熟悉的 SQL 语法，迁移成本低

## 快速开始

```bash
# 创建数据库
npx wrangler d1 create my-db

# 执行迁移
npx wrangler d1 execute my-db --file=./migrations/0001_init.sql

# 本地开发
npx wrangler pages dev --d1=DB
```

## 最佳实践

- 使用迁移脚本管理 schema 变更
- 合理设计索引，避免全表扫描
- 读多写少的场景考虑缓存
- 定期备份重要数据

D1 对于个人项目和中小流量的应用来说，是一个非常好的选择。',
    'tech',
    'Cloudflare,D1,Serverless,数据库',
    'd1-guide'
),
(
    'life-slow-morning',
    '慢下来的早晨：一杯咖啡与一本书',
    '在这个快节奏的时代，偶尔慢下来，感受生活本来的样子。',
    '# 慢下来的早晨

今天起得比平时早一些。窗外的天刚蒙蒙亮，城市还没有完全醒来。

## 一杯手冲咖啡

我拿出了搁置很久的手冲器具。磨豆、烧水、闷蒸、注水……整个过程大概十分钟。在这十分钟里，我什么都不想，只是专注于水流和咖啡粉的交融。

咖啡的香气慢慢弥漫开来，填满了整个房间。

## 一本闲书

冲好咖啡，我坐在窗边的椅子上，翻开了一本买了很久却一直没读的书。不是什么专业书籍，只是一本散文集。

> 生活的意义，往往藏在那些"无用"的时光里。

没有待办清单，没有消息提醒，只有咖啡、书和渐渐亮起来的天光。

## 一点感悟

我们总在赶路，总觉得前面有更重要的事情。但偶尔停下来才发现——

**最重要的事情，其实就在当下。**

慢一点，也没关系。',
    'life',
    '生活,随笔,慢生活',
    'slow-morning'
),
(
    'resource-dev-tools-2026',
    '【资源分享】2026 开发者必备工具合集',
    '整理了一批我日常使用的开发工具和资源，涵盖 IDE、命令行工具、设计资源等。',
    '# 2026 开发者必备工具合集

分享一些我日常工作中高频使用的工具和资源，希望对你有帮助。

## 网盘资源

所有资源已打包上传，包含以下内容：

### 开发工具
- VS Code 插件配置备份
- iTerm2 + Oh My Zsh 配置
- Postman 接口集合模板

### 设计资源
- 常用图标库合集（SVG 格式）
- 配色方案参考手册
- UI 组件设计模板

### 学习资料
- 系统设计面试指南
- 算法刷题笔记（Python 版）
- 分布式系统论文精选

## 下载链接

> 资源不定期更新，欢迎收藏本页。

完整资源包已上传至网盘，见下方资源卡片。',
    'resource',
    '资源分享,开发工具,网盘',
    'dev-tools'
);

-- Insert sample resources
INSERT OR IGNORE INTO resources (title, description, url, category, file_size, password) VALUES
(
    '2026 开发者工具合集',
    'IDE 配置、命令行工具、设计资源、学习资料大礼包',
    'https://pan.baidu.com/s/1abc123def456',
    '开发工具',
    '2.3 GB',
    'wang2026'
),
(
    'AI 论文精选集',
    '2024-2026 年值得一读的 AI 领域顶会论文',
    'https://drive.google.com/drive/folders/xyz789',
    '学习资料',
    '500 MB',
    ''
),
(
    '极简博客模板源码',
    '本博客的完整源码，可直接部署到 Cloudflare Pages',
    'https://github.com/example/wangs-notebook',
    '源码',
    '1.2 MB',
    ''
);

-- Create a demo user (password: demo123456, hash is placeholder - real hash generated at runtime)
-- Note: In production, users register through the API which properly hashes passwords
