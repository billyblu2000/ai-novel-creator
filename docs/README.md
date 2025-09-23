# AI Novel Creator

一个基于AI的现代化小说创作应用程序，使用全栈TypeScript技术构建，为作家提供完整的创作工具生态系统。

## 🎯 项目愿景

AI Novel Creator 旨在成为作家的智能创作伙伴，通过现代化的数字工具和AI技术，降低小说创作的技术门槛，提升创作效率，让作家能够专注于故事本身的创作。

## ✨ 核心特性

### 📚 完整的创作工具生态
- **项目管理**：多项目管理，支持不同创作阶段
- **角色管理**：角色信息、重要性评级、情节关联
- **世界设定**：分类管理世界观、历史、文化等设定
- **情节管理**：5级层次结构（书→部→章→场景→节拍）
- **时间线管理**：可视化的故事时间线组织
- **笔记系统**：灵感记录、研究资料、待办事项

### 🎨 现代化用户体验
- **工作区模式**：类似IDE的统一创作环境
- **可视化层级**：颜色编码和缩进展示内容层次
- **重要性指示**：背景色渐变展示元素重要性
- **响应式设计**：完美适配桌面、平板、手机
- **实时反馈**：操作结果的即时可视化

### 🔧 技术架构优势
- **类型安全**：TypeScript全栈开发，减少运行时错误
- **现代化栈**：React 18 + Node.js + Prisma + PostgreSQL
- **云原生部署**：Vercel + Supabase，全球CDN加速
- **可扩展架构**：模块化设计，易于功能扩展

## 🏗️ 项目结构

```
ai-novel-creator/
├── backend/                 # Node.js + Express + TypeScript 后端
│   ├── src/
│   │   ├── index.ts         # 主服务器文件
│   │   └── routes/          # API路由模块
│   │       ├── projects.ts           # 项目管理
│   │       ├── characters.ts         # 角色管理
│   │       ├── worldSettings.ts      # 世界设定
│   │       ├── plotElements.ts       # 情节管理（核心）
│   │       ├── timelines.ts          # 时间线管理
│   │       └── projectNotes.ts       # 笔记管理
│   ├── prisma/
│   │   └── schema.prisma    # 完整数据模型（9个核心模型）
│   └── package.json
├── frontend/                # React + TypeScript + Vite 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx         # 项目仪表盘
│   │   │   ├── ProjectWorkspace.tsx  # 主工作区
│   │   │   └── workspace/            # 工作区模块
│   │   │       ├── ProjectOverview.tsx      # 项目概览
│   │   │       ├── CharactersManager.tsx    # 角色管理
│   │   │       ├── WorldSettingsManager.tsx # 世界设定管理
│   │   │       ├── PlotElementsManager.tsx  # 情节管理
│   │   │       ├── TimelineManager.tsx      # 时间线管理
│   │   │       ├── NotesManager.tsx         # 笔记管理
│   │   │       └── ProjectSettings.tsx      # 项目设置
│   │   ├── services/
│   │   │   └── api.ts       # API服务层
│   │   ├── types/
│   │   │   └── index.ts     # TypeScript类型定义
│   │   └── App.tsx
│   └── package.json
├── docs/                    # 项目文档
│   ├── README.md            # 项目说明（本文件）
│   └── notes/               # 开发笔记
│       ├── STAGE1_COMPLETE.md       # Stage 1 完成总结
│       ├── STAGE2_DEV_NOTES.md      # Stage 2 开发要点
│       └── STAGE2_COMPLETE.md       # Stage 2 完成总结
└── vercel.json              # 部署配置
```

## 🛠️ 技术栈

### 后端技术
- **Node.js** + **Express.js** - 高性能Web服务器
- **TypeScript** - 类型安全的JavaScript超集
- **Prisma** - 现代数据库ORM，类型安全的数据访问
- **PostgreSQL** - 可靠的关系型数据库（Supabase托管）
- **OpenAI API** - AI语言模型集成（为Stage 3准备）

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

# OpenAI API密钥（Stage 3功能）
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

打开浏览器访问 http://localhost:5173，开始你的小说创作之旅！

## 📖 使用指南

### 基础工作流程

1. **创建项目**：在仪表盘点击"创建新项目"
2. **进入工作区**：点击项目卡片进入创作工作区
3. **设置角色**：在角色管理中添加主要角色信息
4. **构建世界**：在世界设定中建立故事背景
5. **规划情节**：在情节管理中构建故事结构
6. **组织时间线**：在时间线管理中安排故事发展
7. **记录灵感**：在笔记系统中记录创作想法

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

#### 项目管理
```
GET    /api/projects           # 获取所有项目
POST   /api/projects           # 创建新项目
GET    /api/projects/:id       # 获取项目详情
PUT    /api/projects/:id       # 更新项目
DELETE /api/projects/:id       # 删除项目
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
Project (项目)
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

### 🎉 已完成功能（Stage 1 & 2）

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

### 🚧 开发中功能（Stage 3）

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

### 📋 未来规划（Stage 4+）

- 📅 用户认证和多用户支持
- 📅 云端同步和备份
- 📅 移动端应用
- 📅 社区功能和作品分享
- 📅 出版流程集成
- 📅 多语言支持

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