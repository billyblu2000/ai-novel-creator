# 🚀 AI Novel Creator 部署指南

## 📋 部署前准备

### 1. 代码修改总结
已完成的修改：
- ✅ 数据库从 SQLite 改为 PostgreSQL
- ✅ 添加生产环境 CORS 配置
- ✅ 前端 API 地址自动适配
- ✅ 添加 Vercel 配置文件
- ✅ 安装 PostgreSQL 客户端

### 2. 需要的外部服务
- **数据库**: Vercel Postgres / Supabase / Railway
- **部署平台**: Vercel / Netlify / Railway

## 🌐 Vercel 部署步骤

### 方案一：Vercel + Vercel Postgres（推荐）

#### 1. 准备 Git 仓库
```bash
cd ai-novel-creator
git init
git add .
git commit -m "Initial commit - AI Novel Creator"

# 推送到 GitHub
git remote add origin https://github.com/yourusername/ai-novel-creator.git
git push -u origin main
```

#### 2. 部署到 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `cd frontend && npm run vercel-build`
   - **Output Directory**: `frontend/dist`

#### 3. 配置数据库
1. 在 Vercel 项目中，进入 "Storage" 标签
2. 创建 "Postgres" 数据库
3. 复制数据库连接字符串

#### 4. 设置环境变量
在 Vercel 项目设置中添加：
```
DATABASE_URL=postgresql://...（从 Vercel Postgres 获取）
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

#### 5. 更新 CORS 域名
部署后，更新 `backend/src/index.ts` 中的域名：
```typescript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-actual-domain.vercel.app'] // 替换为实际域名
  : ['http://localhost:5173', 'http://localhost:3000'],
```

### 方案二：Vercel + Supabase

#### 1. 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取数据库连接字符串

#### 2. 配置环境变量
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

#### 3. 其他步骤同方案一

## 🛠️ 其他部署平台

### Railway 部署
1. 访问 [railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 添加 PostgreSQL 服务
4. 配置环境变量
5. 部署

### Netlify + 外部数据库
1. 前端部署到 Netlify
2. 后端部署到 Railway/Render
3. 配置跨域和环境变量

## 🔧 本地开发环境迁移

### 1. 安装 PostgreSQL（可选）
```bash
# macOS
brew install postgresql
brew services start postgresql

# 创建数据库
createdb ai_novel_creator
```

### 2. 更新本地环境变量
```bash
# backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_novel_creator"
OPENAI_API_KEY=your_api_key_here
```

### 3. 迁移数据库
```bash
cd backend
npx prisma db push
npx prisma generate
```

## 📝 部署检查清单

### 部署前
- [ ] 代码推送到 Git 仓库
- [ ] 环境变量配置完成
- [ ] 数据库服务准备就绪
- [ ] CORS 域名配置正确

### 部署后
- [ ] 前端页面正常访问
- [ ] API 健康检查通过 (`/api/health`)
- [ ] 数据库连接正常
- [ ] 项目 CRUD 功能正常
- [ ] 跨域请求正常

## 🐛 常见问题解决

### 1. 数据库连接失败
```
Error: P1001: Can't reach database server
```
**解决方案**：
- 检查 DATABASE_URL 格式
- 确认数据库服务运行正常
- 检查网络连接和防火墙

### 2. CORS 错误
```
Access to XMLHttpRequest blocked by CORS policy
```
**解决方案**：
- 更新 backend/src/index.ts 中的 origin 配置
- 确认域名拼写正确
- 重新部署后端

### 3. 构建失败
```
Build failed with exit code 1
```
**解决方案**：
- 检查 package.json 中的构建脚本
- 确认所有依赖已安装
- 查看构建日志详细错误

### 4. 环境变量未生效
**解决方案**：
- 确认变量名拼写正确
- 重新部署项目
- 检查平台的环境变量设置

## 🔄 更新部署

### 自动部署
推送到 main 分支会自动触发部署：
```bash
git add .
git commit -m "Update features"
git push origin main
```

### 手动部署
在 Vercel 控制台点击 "Redeploy"

## 📊 监控和维护

### 1. 日志查看
- Vercel: Functions 标签页查看后端日志
- 浏览器: 开发者工具查看前端错误

### 2. 性能监控
- Vercel Analytics
- 数据库连接池监控
- API 响应时间

### 3. 备份策略
- 定期导出数据库数据
- 代码版本控制
- 环境变量备份

## 🎉 部署成功！

部署完成后，你将拥有：
- ✅ 生产级的 AI 小说创作器
- ✅ 自动 HTTPS 和 CDN
- ✅ 全球访问加速
- ✅ 自动部署流水线

访问你的应用：`https://your-app-name.vercel.app`

## 🚀 下一步

部署成功后，可以考虑：
1. 添加自定义域名
2. 配置监控和告警
3. 优化性能和 SEO
4. 添加用户认证系统
5. 开始第二阶段功能开发

祝贺你成功部署了 AI Novel Creator！🎊