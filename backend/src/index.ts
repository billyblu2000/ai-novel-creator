import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projects';
import characterRoutes from './routes/characters';
import worldSettingRoutes from './routes/worldSettings';
import plotElementRoutes from './routes/plotElements';
import timelineRoutes from './routes/timelines';
import projectNoteRoutes from './routes/projectNotes';

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
app.use('/api/projects', projectRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/world-settings', worldSettingRoutes);
app.use('/api/plot-elements', plotElementRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/project-notes', projectNoteRoutes);

// 404处理
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Novel Creator Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎭 Environment: ${process.env.NODE_ENV || 'development'}`);
});