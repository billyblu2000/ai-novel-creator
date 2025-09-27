import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import characterRoutes from './routes/characters';
import worldSettingRoutes from './routes/worldSettings';
import plotElementRoutes from './routes/plotElements';
import timelineRoutes from './routes/timelines';
import projectNoteRoutes from './routes/projectNotes';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-name.vercel.app'] // 替换为你的实际域名
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制，支持长文本内容

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API路由
app.use('/api/auth', authRoutes); // 认证路由不需要认证
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/characters', authenticateToken, characterRoutes);
app.use('/api/world-settings', authenticateToken, worldSettingRoutes);
app.use('/api/plot-elements', authenticateToken, plotElementRoutes);
app.use('/api/timelines', authenticateToken, timelineRoutes);
app.use('/api/project-notes', authenticateToken, projectNoteRoutes);

// 404处理
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Novel Creator Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎭 Environment: ${process.env.NODE_ENV || 'development'}`);
});