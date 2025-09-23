# AI Novel Creator

一个基于AI的小说创作应用程序，使用现代全栈技术构建。

## 项目结构

```
ai-novel-creator/
├── backend/          # Node.js + Express + TypeScript 后端
│   ├── src/
│   │   └── index.ts  # 主服务器文件
│   ├── prisma/
│   │   └── schema.prisma  # 数据库模式
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React + TypeScript + Vite 前端
│   ├── src/
│   │   ├── App.tsx   # 主应用组件
│   │   ├── main.tsx  # 应用入口
│   │   └── index.css # Tailwind CSS样式
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 技术栈

### 后端
- **Node.js** + **Express.js** - Web服务器框架
- **TypeScript** - 类型安全的JavaScript
- **Prisma** - 现代数据库ORM
- **SQLite** - 轻量级数据库
- **LanceDB** - 向量数据库（用于AI嵌入）
- **OpenAI API** - AI语言模型集成

### 前端
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Axios** - HTTP客户端

## 快速开始

### 1. 环境设置

首先，在后端目录创建环境变量文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，添加您的OpenAI API密钥：

```
OPENAI_API_KEY=your_actual_api_key_here
DATABASE_URL="file:./dev.db"
```

### 2. 安装依赖并启动开发服务器

**启动后端服务器：**

```bash
cd backend
npm run dev
```

后端服务器将在 http://localhost:3001 启动

**启动前端开发服务器：**

```bash
cd frontend
npm run dev
```

前端应用将在 http://localhost:5173 启动

### 3. 数据库设置

初始化并生成Prisma客户端：

```bash
cd backend
npx prisma generate
npx prisma db push
```

## API端点

- `GET /api/health` - 健康检查端点

## 开发指南

1. 后端API开发在 `backend/src/` 目录
2. 前端组件开发在 `frontend/src/` 目录
3. 数据库模式定义在 `backend/prisma/schema.prisma`
4. 使用 `npm run dev` 启动开发服务器（支持热重载）

## 下一步开发建议

1. 添加用户认证系统
2. 实现小说项目管理功能
3. 集成AI写作助手
4. 添加文本编辑器
5. 实现向量搜索功能
6. 添加用户界面组件

## 许可证

MIT License