# AI Novel Creator

一个基于AI的现代化小说创作应用程序，使用全栈TypeScript技术构建，为作家提供完整的创作工具生态系统。

## 🎯 项目愿景

AI Novel Creator 旨在成为作家的智能创作伙伴，通过现代化的数字工具和AI技术，降低小说创作的技术门槛，提升创作效率，让作家能够专注于故事本身的创作。

## ✨ 核心特性

### 🔐 安全的用户系统
- **用户认证**：JWT令牌认证，安全可靠的登录注册
- **多用户支持**：每个用户拥有独立的创作空间
- **数据隔离**：用户数据完全隔离，保护创作隐私
- **权限控制**：API层面的严格权限验证
- **会话管理**：自动登录保持，安全的登出机制

### 📚 完整的创作工具生态
- **项目管理**：用户专属的多项目管理，支持不同创作阶段
- **角色管理**：角色信息、重要性评级、情节关联
- **世界设定**：分类管理世界观、历史、文化等设定
- **情节管理**：5级层次结构（书→部→章→场景→节拍）
- **时间线管理**：可视化的故事时间线组织
- **笔记系统**：灵感记录、研究资料、待办事项

### 🎨 现代化用户体验
- **黑白极简设计**：统一的设计语言，优雅简洁
- **工作区模式**：类似IDE的统一创作环境
- **可视化层级**：颜色编码和缩进展示内容层次
- **重要性指示**：背景色渐变展示元素重要性
- **个性化界面**：用户专属的问候和身份标识
- **响应式设计**：完美适配桌面、平板、手机
- **实时反馈**：操作结果的即时可视化

### 🔧 技术架构优势
- **类型安全**：TypeScript全栈开发，减少运行时错误
- **安全认证**：JWT + bcrypt的行业标准安全方案
- **现代化栈**：React 18 + Node.js + Prisma + PostgreSQL
- **云原生部署**：Vercel + Supabase，全球CDN加速
- **可扩展架构**：模块化设计，易于功能扩展

## 🏗️ 项目结构

```
ai-novel-creator/
├── backend/                 # Node.js + Express + TypeScript 后端
│   ├── src/
│   │   ├── index.ts         # 主服务器文件
│   │   ├── middleware/
│   │   │   └── auth.ts      # 认证中间件
│   │   └── routes/          # API路由模块
│   │       ├── auth.ts              # 用户认证（新增）
│   │       ├── projects.ts          # 项目管理（用户隔离）
│   │       ├── characters.ts        # 角色管理（权限保护）
│   │       ├── worldSettings.ts     # 世界设定（权限保护）
│   │       ├── plotElements.ts      # 情节管理（权限保护）
│   │       ├── timelines.ts         # 时间线管理（权限保护）
│   │       └── projectNotes.ts      # 笔记管理（权限保护）
│   ├── prisma/
│   │   └── schema.prisma    # 完整数据模型（用户系统 + 多用户支持）
│   └── package.json         # 新增认证依赖
├── frontend/                # React + TypeScript + Vite 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.tsx         # 登录页面（新增）
│   │   │   ├── RegisterPage.tsx      # 注册页面（新增）
│   │   │   ├── UserMenu.tsx          # 用户菜单（新增）
│   │   │   ├── ProtectedRoute.tsx    # 路由保护（新增）
│   │   │   ├── Dashboard.tsx         # 用户专属项目列表
│   │   │   ├── ProjectWorkspace.tsx  # 权限保护的工作区
│   │   │   └── workspace/            # 工作区模块
│   │   │       ├── ProjectOverview.tsx      # 项目概览
│   │   │       ├── CharactersManager.tsx    # 角色管理
│   │   │       ├── WorldSettingsManager.tsx # 世界设定管理
│   │   │       ├── PlotElementsManager.tsx  # 情节管理
│   │   │       ├── TimelineManager.tsx      # 时间线管理
│   │   │       ├── NotesManager.tsx         # 笔记管理
│   │   │       └── ProjectSettings.tsx      # 项目设置
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # 认证状态管理（新增）
│   │   ├── services/
│   │   │   └── api.ts       # API服务层（认证集成）
│   │   ├── types/
│   │   │   └── index.ts     # TypeScript类型定义（用户类型）
│   │   └── App.tsx          # 路由配置（认证集成）
│   └── package.json
├── docs/                    # 项目文档
│   ├── README.md            # 项目说明（本文件）
│   └── notes/               # 开发笔记
│       ├── STAGE1_COMPLETE.md       # Stage 1 完成总结
│       ├── STAGE1_DEV_NOTES.md      # Stage 1 开发要点
│       ├── STAGE2_COMPLETE.md       # Stage 2 完成总结
│       ├── STAGE2_DEV_NOTES.md      # Stage 2 开发要点
│       ├── STAGE3_COMPLETE.md       # Stage 3 完成总结（新增）
│       └── STAGE3_DEV_NOTES.md      # Stage 3 开发要点（新增）
└── vercel.json              # 部署配置
```

## 🛠️ 技术栈

### 后端技术
- **Node.js** + **Express.js** - 高性能Web服务器
- **TypeScript** - 类型安全的JavaScript超集
- **Prisma** - 现代数据库ORM，类型安全的数据访问
- **PostgreSQL** - 可靠的关系型数据库（Supabase托管）
- **JWT** - 无状态的用户认证方案
- **bcrypt** - 安全的密码加密存储
- **OpenAI API** - AI语言模型集成（为Stage 4准备）

### 前端技术
- **React 18** - 现代化用户界面库
- **TypeScript** - 类型安全的前端开发
- **Vite** - 极速的构建工具和开发服务器
- **Tailwind CSS v4** - 实用优先的CSS框架
- **Axios** - 优雅的HTTP客户端
- **Lucide React** - 现代化图标库

### 部署和运维
- **Vercel** - 前端和API的无服务器部署
- **Supabase** - PostgreSQL数据库托管
- **GitHub** - 代码版本控制和CI/CD触发
- **HTTPS + CDN** - 全球加速和安全访问

## 🚀 快速开始

### 1. 环境准备

确保你的开发环境已安装：
- **Node.js** 18+ 
- **npm** 或 **yarn**
- **Git**

### 2. 克隆项目

```bash
git clone https://github.com/your-username/ai-novel-creator.git
cd ai-novel-creator
```

### 3. 环境变量配置

在后端目录创建环境变量文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库连接（使用Supabase PostgreSQL）
DATABASE_URL="postgresql://username:password@host:5432/database"

# JWT密钥（用户认证）
JWT_SECRET="your-super-secret-jwt-key-here"

# OpenAI API密钥（Stage 4功能）
OPENAI_API_KEY="your_openai_api_key_here"

# 环境标识
NODE_ENV="development"
```

### 4. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 5. 数据库初始化

```bash
cd backend

# 生成Prisma客户端
npx prisma generate

# 推送数据库结构
npx prisma db push

# （可选）插入测试数据
node insert-test-data.js
```

### 6. 启动开发服务器

**启动后端服务器：**
```bash
cd backend
npm run dev
```
后端API服务器将在 http://localhost:3001 启动

**启动前端开发服务器：**
```bash
cd frontend
npm run dev
```
前端应用将在 http://localhost:5173 启动

### 7. 访问应用

打开浏览器访问 http://localhost:5173，首先注册一个账户，然后开始你的小说创作之旅！

## 📖 使用指南

### 基础工作流程

1. **用户注册**：首次使用需要注册账户，创建个人创作空间
2. **用户登录**：使用邮箱和密码登录到专属创作环境
3. **创建项目**：在仪表盘点击"创建新项目"
4. **进入工作区**：点击项目卡片进入创作工作区
5. **设置角色**：在角色管理中添加主要角色信息
6. **构建世界**：在世界设定中建立故事背景
7. **规划情节**：在情节管理中构建故事结构
8. **组织时间线**：在时间线管理中安排故事发展
9. **记录灵感**：在笔记系统中记录创作想法

### 核心功能详解

#### 情节管理系统
- **5级层次结构**：书 → 部 → 章 → 场景 → 节拍
- **可视化层级**：不同颜色的左边框表示不同层级
- **重要性指示**：背景色深浅表示内容重要性
- **内容管理**：标题、摘要、正文内容统一管理
- **状态跟踪**：计划中、进行中、已完成、需修改

#### 时间线可视化
- **垂直时间轴**：清晰展示故事发展顺序
- **时间线容器**：将相关情节组织在一起
- **叶子节点显示**：只显示最底层的具体情节
- **连接线可视化**：直观的时间流向展示

#### 角色关联系统
- **多维关联**：角色可以关联到多个情节
- **角色作用**：记录角色在不同情节中的作用
- **重要性评级**：1-10级重要性，支持优先级管理

## 🔧 开发指南

### API接口文档

#### 用户认证
```
POST   /api/auth/register      # 用户注册
POST   /api/auth/login         # 用户登录
```

#### 项目管理（需要认证）
```
GET    /api/projects           # 获取用户项目列表
POST   /api/projects           # 创建新项目
GET    /api/projects/:id       # 获取项目详情（权限验证）
PUT    /api/projects/:id       # 更新项目（权限验证）
DELETE /api/projects/:id       # 删除项目（权限验证）
```

#### 角色管理
```
GET    /api/characters/:projectId    # 获取项目角色列表
POST   /api/characters              # 创建新角色
GET    /api/characters/detail/:id   # 获取角色详情
PUT    /api/characters/:id          # 更新角色
DELETE /api/characters/:id          # 删除角色
```

#### 情节管理（核心API）
```
GET    /api/plot-elements/:projectId           # 获取项目情节
POST   /api/plot-elements                      # 创建新情节
GET    /api/plot-elements/detail/:id           # 获取情节详情
PUT    /api/plot-elements/:id                  # 更新情节
DELETE /api/plot-elements/:id                  # 删除情节
POST   /api/plot-elements/:id/characters       # 关联角色
DELETE /api/plot-elements/:id/characters/:cid  # 取消角色关联
```

更多API详情请参考 `backend/src/routes/` 目录下的路由文件。

### 数据模型

#### 核心模型关系
```
User (用户) - 新增
└── Project (项目) - 增加用户关联
    ├── Character (角色)
    ├── WorldSetting (世界设定)
    ├── PlotElement (情节元素) - 核心模型
    ├── Timeline (时间线)
    └── ProjectNote (项目笔记)

PlotElement 关联关系：
├── PlotElementCharacter (情节-角色关联)
├── PlotElementSetting (情节-设定关联)
└── PlotElementTimeline (情节-时间线关联)
```

详细的数据模型定义请参考 `backend/prisma/schema.prisma`。

### 组件开发

#### 组件命名规范
- **页面组件**：PascalCase，如 `ProjectWorkspace`
- **管理器组件**：以 `Manager` 结尾，如 `CharactersManager`
- **卡片组件**：以 `Card` 结尾，如 `PlotElementCard`
- **模态框组件**：以 `Modal` 结尾，如 `CreateProjectModal`

#### 样式规范
- **使用Tailwind CSS**：优先使用Tailwind类名
- **响应式设计**：使用 `md:` 和 `lg:` 前缀
- **一致的间距**：使用 `space-y-4`、`p-4` 等标准间距
- **统一的圆角**：使用 `rounded-lg`
- **一致的动画**：使用 `transition-all duration-200`

## 📊 项目状态

### 🎉 已完成功能（Stage 1-3）

#### Stage 1: 项目管理基础
- ✅ 项目CRUD操作
- ✅ 现代化UI设计
- ✅ 响应式布局
- ✅ 生产环境部署

#### Stage 2: 核心创作功能
- ✅ 完整数据模型设计（9个核心模型）
- ✅ 角色管理系统
- ✅ 世界设定管理
- ✅ 情节管理系统（5级层次）
- ✅ 时间线可视化
- ✅ 项目笔记系统
- ✅ 工作区模式界面
- ✅ 可视化层级和重要性系统
- ✅ 完整的关联管理功能

#### Stage 3: 用户认证系统
- ✅ JWT令牌认证系统
- ✅ 用户注册和登录功能
- ✅ bcrypt密码安全加密
- ✅ 多用户数据隔离
- ✅ API权限保护全覆盖
- ✅ React Context认证状态管理
- ✅ 保护路由系统
- ✅ 黑白极简认证界面
- ✅ 用户菜单和个性化体验
- ✅ 生产环境稳定部署

### 🚧 开发中功能（Stage 4）

#### AI增强创作功能
- 🔄 AI写作助手集成
- 🔄 智能内容生成
- 🔄 角色对话生成器
- 🔄 情节发展建议
- 🔄 文本分析和优化

#### 高级功能
- 🔄 实时协作编辑
- 🔄 版本控制系统
- 🔄 导出功能（PDF、EPUB等）
- 🔄 高级搜索和筛选

### 📋 未来规划（Stage 5+）

- 📅 云端同步和备份
- 📅 移动端应用
- 📅 社区功能和作品分享
- 📅 出版流程集成
- 📅 多语言支持
- 📅 高级用户管理功能

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是功能建议、Bug报告、代码贡献还是文档改进。

### 贡献方式

1. **Fork项目**到你的GitHub账户
2. **创建功能分支**：`git checkout -b feature/amazing-feature`
3. **提交更改**：`git commit -m 'Add some amazing feature'`
4. **推送分支**：`git push origin feature/amazing-feature`
5. **创建Pull Request**

### 开发规范

- **代码风格**：遵循项目的ESLint和Prettier配置
- **提交信息**：使用清晰的提交信息描述更改
- **测试**：确保新功能有适当的测试覆盖
- **文档**：更新相关文档和README

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户。特别感谢：

- **React团队** - 提供了优秀的前端框架
- **Vercel团队** - 提供了出色的部署平台
- **Prisma团队** - 提供了现代化的数据库工具
- **Tailwind CSS团队** - 提供了高效的CSS框架

## 📞 联系我们

- **项目主页**：https://github.com/your-username/ai-novel-creator
- **在线演示**：https://ai-novel-creator.vercel.app
- **问题反馈**：https://github.com/your-username/ai-novel-creator/issues
- **功能建议**：https://github.com/your-username/ai-novel-creator/discussions

---

**让创作更简单，让故事更精彩！** 🚀✨