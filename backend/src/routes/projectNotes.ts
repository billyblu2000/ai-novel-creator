import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/project-notes/:projectId - 获取项目的所有笔记
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, tags } = req.query;
    
    const whereClause: any = { projectId };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      whereClause.tags = {
        hasSome: tagArray
      };
    }
    
    const projectNotes = await prisma.projectNote.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    res.json(projectNotes);
  } catch (error) {
    console.error('Error fetching project notes:', error);
    res.status(500).json({ error: 'Failed to fetch project notes' });
  }
});

// GET /api/project-notes/detail/:id - 获取单个笔记详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const projectNote = await prisma.projectNote.findUnique({
      where: { id }
    });
    
    if (!projectNote) {
      return res.status(404).json({ error: 'Project note not found' });
    }
    
    res.json(projectNote);
  } catch (error) {
    console.error('Error fetching project note:', error);
    res.status(500).json({ error: 'Failed to fetch project note' });
  }
});

// POST /api/project-notes - 创建新笔记
router.post('/', async (req, res) => {
  try {
    const { projectId, title, content, category, tags } = req.body;
    
    if (!projectId || !title || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, title, content, category' 
      });
    }
    
    const projectNote = await prisma.projectNote.create({
      data: {
        projectId,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags || []
      }
    });
    
    res.status(201).json(projectNote);
  } catch (error) {
    console.error('Error creating project note:', error);
    res.status(500).json({ error: 'Failed to create project note' });
  }
});

// PUT /api/project-notes/:id - 更新笔记
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags || [];
    
    const projectNote = await prisma.projectNote.update({
      where: { id },
      data: updateData
    });
    
    res.json(projectNote);
  } catch (error) {
    console.error('Error updating project note:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project note not found' });
    }
    res.status(500).json({ error: 'Failed to update project note' });
  }
});

// DELETE /api/project-notes/:id - 删除笔记
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.projectNote.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project note:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project note not found' });
    }
    res.status(500).json({ error: 'Failed to delete project note' });
  }
});

// GET /api/project-notes/categories/:projectId - 获取项目的所有笔记分类
router.get('/categories/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const categories = await prisma.projectNote.findMany({
      where: { projectId },
      select: { category: true },
      distinct: ['category']
    });
    
    const categoryList = categories.map(item => item.category);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching note categories:', error);
    res.status(500).json({ error: 'Failed to fetch note categories' });
  }
});

// GET /api/project-notes/tags/:projectId - 获取项目的所有标签
router.get('/tags/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const notes = await prisma.projectNote.findMany({
      where: { projectId },
      select: { tags: true }
    });
    
    // 合并所有标签并去重
    const allTags = notes.reduce((acc, note) => {
      return acc.concat(note.tags);
    }, [] as string[]);
    
    const uniqueTags = [...new Set(allTags)].sort();
    
    res.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching note tags:', error);
    res.status(500).json({ error: 'Failed to fetch note tags' });
  }
});

export default router;