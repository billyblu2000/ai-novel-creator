import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/world-settings/:projectId - 获取项目的所有世界设定
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category } = req.query;
    
    const whereClause: any = { projectId };
    if (category) {
      whereClause.category = category;
    }
    
    const worldSettings = await prisma.worldSetting.findMany({
      where: whereClause,
      include: {
        plotElements: {
          include: {
            plotElement: {
              select: { id: true, title: true, type: true }
            }
          }
        }
      },
      orderBy: [
        { importance: 'desc' },
        { category: 'asc' },
        { createdAt: 'asc' }
      ]
    });
    
    return res.json(worldSettings);
  } catch (error: any) {
    console.error('Error fetching world settings:', error);
    return res.status(500).json({ error: 'Failed to fetch world settings' });
  }
});

// GET /api/world-settings/detail/:id - 获取单个世界设定详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const worldSetting = await prisma.worldSetting.findUnique({
      where: { id },
      include: {
        plotElements: {
          include: {
            plotElement: {
              select: { id: true, title: true, type: true, status: true }
            }
          }
        }
      }
    });
    
    if (!worldSetting) {
      return res.status(404).json({ error: 'World setting not found' });
    }
    
    return res.json(worldSetting);
  } catch (error: any) {
    console.error('Error fetching world setting:', error);
    return res.status(500).json({ error: 'Failed to fetch world setting' });
  }
});

// POST /api/world-settings - 创建新世界设定
router.post('/', async (req, res) => {
  try {
    const { projectId, category, title, content, importance } = req.body;
    
    if (!projectId || !category || !title || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, category, title, content' 
      });
    }
    
    const worldSetting = await prisma.worldSetting.create({
      data: {
        projectId,
        category,
        title: title.trim(),
        content: content.trim(),
        importance: importance || 5
      }
    });
    
    return res.status(201).json(worldSetting);
  } catch (error: any) {
    console.error('Error creating world setting:', error);
    return res.status(500).json({ error: 'Failed to create world setting' });
  }
});

// PUT /api/world-settings/:id - 更新世界设定
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, content, importance } = req.body;
    
    const worldSetting = await prisma.worldSetting.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(title && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(importance !== undefined && { importance })
      }
    });
    
    return res.json(worldSetting);
  } catch (error: any) {
    console.error('Error updating world setting:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'World setting not found' });
    }
    return res.status(500).json({ error: 'Failed to update world setting' });
  }
});

// DELETE /api/world-settings/:id - 删除世界设定
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.worldSetting.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting world setting:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'World setting not found' });
    }
    return res.status(500).json({ error: 'Failed to delete world setting' });
  }
});

// GET /api/world-settings/categories/:projectId - 获取项目的所有设定分类
router.get('/categories/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const categories = await prisma.worldSetting.findMany({
      where: { projectId },
      select: { category: true },
      distinct: ['category']
    });
    
    const categoryList = categories.map(item => item.category);
    return res.json(categoryList);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;