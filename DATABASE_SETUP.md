# 数据库设置指南

## 🗄️ 当前状态

您的应用已成功部署，但数据库表结构还未创建。这是因为我们在构建过程中移除了 `prisma db push` 来避免构建超时。

## 🔧 解决方案

### 方法1: 手动初始化数据库（推荐）

1. **在本地运行数据库迁移**：
   ```bash
   cd ai-novel-creator/backend
   npm run db:deploy
   ```

2. **或者使用Vercel CLI**：
   ```bash
   # 安装Vercel CLI（如果还没有）
   npm i -g vercel
   
   # 登录并链接项目
   vercel link
   
   # 运行数据库迁移
   vercel env pull .env.local
   npm run db:deploy
   ```

### 方法2: 通过API端点初始化

我们可以创建一个一次性的初始化端点：

```typescript
// 在 backend/src/index.ts 中添加
app.post('/api/init-db', async (req, res) => {
  try {
    // 这里会自动创建表结构（如果不存在）
    await prisma.project.findMany();
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});
```

然后访问：`https://your-app.vercel.app/api/init-db`

### 方法3: 恢复构建时的数据库推送

如果您想要在每次部署时自动创建表结构：

```json
{
  "vercel-build": "npm run build && npx prisma generate && npx prisma db push"
}
```

**注意**：这可能会导致构建超时，特别是在数据库连接较慢时。

## 🎯 推荐做法

1. **首次部署**：使用方法1手动初始化数据库
2. **后续部署**：保持当前的构建配置（不包含db push）
3. **数据库更改**：在本地测试后手动运行迁移

## ✅ 验证数据库

初始化完成后，测试以下端点：
- `GET /api/health` - 应该返回 `{"status":"ok"}`
- `GET /api/projects` - 应该返回空数组 `[]`
- `POST /api/projects` - 创建测试项目

## 🚨 注意事项

- Supabase数据库已经创建，只需要创建表结构
- 所有环境变量已正确配置
- 数据库连接字符串使用的是直连端口（5432）而不是连接池端口（6543）