# Stage 1 开发笔记

## 🎯 项目概述

AI Novel Creator - 基于AI的小说创作工具，采用现代全栈架构。

**技术栈**：
- 后端：Node.js + TypeScript + Express + Prisma + PostgreSQL
- 前端：React + TypeScript + Vite + Tailwind CSS
- 部署：Vercel + Supabase
- 数据库：PostgreSQL (Supabase)

## 📁 项目结构

```
ai-novel-creator/
├── backend/                 # Node.js后端
│   ├── src/
│   │   ├── index.ts        # Express服务器入口
│   │   └── routes/         # API路由
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   └── package.json
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── services/       # API服务
│   │   └── App.tsx
│   └── package.json
├── docs/                   # 项目文档
└── vercel.json            # Vercel部署配置
```

## 🚀 Stage 1 完成功能

### ✅ 项目管理 (Project CRUD)
- **数据库模型**：Project模型包含id、title、description、status、wordCount等字段
- **后端API**：完整的RESTful API (`/api/projects`)
  - GET `/api/projects` - 获取所有项目
  - POST `/api/projects` - 创建新项目
  - PUT `/api/projects/:id` - 更新项目
  - DELETE `/api/projects/:id` - 删除项目
- **前端界面**：
  - Dashboard主页面，展示所有项目
  - ProjectCard组件，支持hover效果和操作菜单
  - CreateProjectModal创建项目弹窗
  - EditProjectModal编辑项目弹窗

### ✅ UI/UX设计
- **设计风格**：Vercel风格的黑白极简设计
- **动画效果**：克制的动画，仅在卡片上使用边框和缩放效果
- **响应式布局**：适配不同屏幕尺寸

## 🛠️ 关键技术实现

### 数据库设计
```prisma
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("draft")
  wordCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API服务层
```typescript
// 前端API服务
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const projectsApi = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};
```

### 组件架构
- **Dashboard**：主容器组件，管理状态和数据流
- **ProjectCard**：项目卡片，包含操作菜单
- **Modal组件**：可复用的弹窗组件（创建/编辑）

## 🚀 部署配置

### 环境变量
```bash
# 生产环境
DATABASE_URL=postgres://...supabase.com:5432/postgres
OPENAI_API_KEY=your_api_key_here
NODE_ENV=production

# 本地开发
DATABASE_URL=postgres://...supabase.com:5432/postgres  # 共享数据库
```

### Vercel配置
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/src/index.ts" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

## 🐛 关键问题解决

### 1. Tailwind CSS v4配置
**问题**：PostCSS插件冲突
**解决**：安装`@tailwindcss/vite`插件，更新Vite配置

### 2. TypeScript构建错误
**问题**：Vercel不支持`erasableSyntaxOnly`选项
**解决**：从tsconfig.json中移除该选项

### 3. 数据库连接
**问题**：PgBouncer连接池冲突
**解决**：使用直连端口5432而非池化端口6543

### 4. 404部署问题
**问题**：Vercel路由配置错误
**解决**：修正文件路径，使用正确的构建输出目录

### 5. 本地开发环境
**问题**：本地和生产环境数据不同步
**解决**：配置本地环境使用Supabase数据库，实现数据共享

## 📋 数据库管理

### 初始化数据库
```bash
# 本地运行
cd backend
npm run db:deploy

# 或使用Vercel CLI
vercel env pull .env.local
npm run db:deploy
```

### 更新数据库结构
1. 修改`prisma/schema.prisma`
2. 运行`npx prisma db push`
3. 提交代码并部署

## 🔧 开发工作流

### 本地开发
```bash
# 启动后端 (端口3001)
cd backend && npm run dev

# 启动前端 (端口5173)
cd frontend && npm run dev
```

### 部署流程
1. 提交代码到Git仓库
2. Vercel自动检测并部署
3. 手动运行数据库迁移（如需要）

## 📊 性能优化

### 前端优化
- 使用Vite进行快速构建
- Tailwind CSS按需加载
- 组件懒加载（为后续阶段准备）

### 后端优化
- Express.js轻量级框架
- Prisma ORM优化查询
- 生产环境CORS配置

## 🎯 下一阶段准备

Stage 1已完成所有目标功能，为Stage 2做好准备：

### 即将开发的功能
1. **故事基座管理**：角色、世界观、大纲模型
2. **章节编辑器**：富文本编辑器集成
3. **AI集成准备**：向量数据库和嵌入服务

### 技术债务
- [ ] 添加单元测试
- [ ] 完善错误处理
- [ ] 添加日志系统
- [ ] 性能监控

## 🏆 成就总结

✅ **完整的项目管理系统**：从创建到删除的完整生命周期
✅ **现代化UI/UX**：Vercel风格的专业界面
✅ **生产级部署**：Vercel + Supabase的稳定架构
✅ **开发环境优化**：本地和生产环境数据共享
✅ **文档完善**：完整的开发和部署文档

**Stage 1圆满完成！** 🎉

---

*最后更新：2025年1月24日*
*项目状态：Stage 1 ✅ 完成，准备进入Stage 2*