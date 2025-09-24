import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/projects - 获取所有项目
router.get('/', async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            characters: true,
            worldSettings: true,
            plotElements: true,
            timelines: true,
            notes: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - 获取单个项目详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        characters: {
          select: { id: true, name: true, role: true, importance: true },
          orderBy: { importance: 'desc' }
        },
        worldSettings: {
          select: { id: true, title: true, category: true, importance: true },
          orderBy: { importance: 'desc' }
        },
        plotElements: {
          where: { parentId: null }, // 只获取顶级元素
          select: { 
            id: true, title: true, type: true, status: true, 
            order: true, wordCount: true, targetWords: true 
          },
          orderBy: { order: 'asc' }
        },
        timelines: {
          select: { id: true, name: true, chronOrder: true, importance: true },
          orderBy: { chronOrder: 'asc' }
        },
        notes: {
          select: { id: true, title: true, category: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5 // 只显示最近的5条笔记
        },
        _count: {
          select: {
            characters: true,
            worldSettings: true,
            plotElements: true,
            timelines: true,
            notes: true
          }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - 创建新项目
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      genre, 
      targetWords, 
      plotViewMode = 'simplified',
      levelNames = {
        book: '书',
        part: '卷', 
        chapter: '章',
        scene: '场景'
      }
    } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // 使用事务创建项目和默认结构
    const result = await prisma.$transaction(async (tx) => {
      // 创建项目
      const project = await tx.project.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          genre: genre || null,
          targetWords: targetWords || null,
          plotViewMode,
          levelNames
        }
      });
      
      // 创建默认的书/部/章结构
      const defaultBook = await tx.plotElement.create({
        data: {
          projectId: project.id,
          title: '默认标题',
          type: 'book',
          order: 1,
          content: '',
          status: 'planned'
        }
      });
      
      const defaultPart = await tx.plotElement.create({
        data: {
          projectId: project.id,
          title: '默认标题',
          type: 'part',
          order: 1,
          parentId: defaultBook.id,
          content: '',
          status: 'planned'
        }
      });
      
      await tx.plotElement.create({
        data: {
          projectId: project.id,
          title: '默认标题',
          type: 'chapter',
          order: 1,
          parentId: defaultPart.id,
          content: '',
          status: 'planned'
        }
      });
      
      return project;
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - 更新项目
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, genre, status, targetWords, plotViewMode, levelNames } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (genre !== undefined) updateData.genre = genre || null;
    if (status !== undefined) updateData.status = status;
    if (targetWords !== undefined) updateData.targetWords = targetWords || null;
    if (plotViewMode !== undefined) updateData.plotViewMode = plotViewMode;
    if (levelNames !== undefined) updateData.levelNames = levelNames;
    
    const project = await prisma.project.update({
      where: { id },
      data: updateData
    });
    
    return res.json(project);
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.project.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting project:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET /api/projects/:id/stats - 获取项目统计信息
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, wordCount: true, targetWords: true }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // 获取详细统计
    const [
      charactersCount,
      worldSettingsCount,
      plotElementsStats,
      timelinesCount,
      notesCount
    ] = await Promise.all([
      prisma.character.count({ where: { projectId: id } }),
      prisma.worldSetting.count({ where: { projectId: id } }),
      prisma.plotElement.aggregate({
        where: { projectId: id },
        _count: { id: true },
        _sum: { wordCount: true }
      }),
      prisma.timeline.count({ where: { projectId: id } }),
      prisma.projectNote.count({ where: { projectId: id } })
    ]);
    
    // 获取各状态的情节统计
    const plotStatusStats = await prisma.plotElement.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: { status: true }
    });
    
    const stats = {
      characters: charactersCount,
      worldSettings: worldSettingsCount,
      plotElements: {
        total: plotElementsStats._count.id || 0,
        totalWords: plotElementsStats._sum.wordCount || 0,
        byStatus: plotStatusStats.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>)
      },
      timelines: timelinesCount,
      notes: notesCount,
      project: {
        wordCount: project.wordCount,
        targetWords: project.targetWords,
        progress: project.targetWords ? 
          Math.round((project.wordCount / project.targetWords) * 100) : 0
      }
    };
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return res.status(500).json({ error: 'Failed to fetch project stats' });
  }
});

export default router;