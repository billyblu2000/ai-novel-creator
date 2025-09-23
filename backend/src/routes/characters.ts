import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/characters/:projectId - 获取项目的所有角色
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const characters = await prisma.character.findMany({
      where: { projectId },
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
        { createdAt: 'asc' }
      ]
    });
    
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// GET /api/characters/detail/:id - 获取单个角色详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const character = await prisma.character.findUnique({
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
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// POST /api/characters - 创建新角色
router.post('/', async (req, res) => {
  try {
    const { projectId, name, role, description, importance } = req.body;
    
    if (!projectId || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields: projectId, name, role' });
    }
    
    const character = await prisma.character.create({
      data: {
        projectId,
        name: name.trim(),
        role,
        description: description || '',
        importance: importance || 5
      }
    });
    
    res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// PUT /api/characters/:id - 更新角色
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, description, importance } = req.body;
    
    const character = await prisma.character.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(role && { role }),
        ...(description !== undefined && { description }),
        ...(importance !== undefined && { importance })
      }
    });
    
    res.json(character);
  } catch (error) {
    console.error('Error updating character:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// DELETE /api/characters/:id - 删除角色
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.character.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting character:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

export default router;