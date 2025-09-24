import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/plot-elements/:projectId - 获取项目的所有情节元素
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type, parentId } = req.query;
    
    const whereClause: any = { projectId };
    if (type) whereClause.type = type;
    if (parentId) whereClause.parentId = parentId;
    if (parentId === 'null') whereClause.parentId = null;
    
    const plotElements = await prisma.plotElement.findMany({
      where: whereClause,
      include: {
        parent: {
          select: { id: true, title: true, type: true }
        },
        children: {
          select: { id: true, title: true, type: true, order: true, status: true },
          orderBy: { order: 'asc' }
        },
        characters: {
          include: {
            character: {
              select: { id: true, name: true, role: true }
            }
          }
        },
        settings: {
          include: {
            setting: {
              select: { id: true, title: true, category: true }
            }
          }
        },
        timelines: {
          include: {
            timeline: {
              select: { id: true, name: true, chronOrder: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });
    
    return res.json(plotElements);
  } catch (error: any) {
    console.error('Error fetching plot elements:', error);
    return res.status(500).json({ error: 'Failed to fetch plot elements' });
  }
});

// GET /api/plot-elements/detail/:id - 获取单个情节元素详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const plotElement = await prisma.plotElement.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, title: true, type: true }
        },
        children: {
          select: { id: true, title: true, type: true, order: true, status: true, wordCount: true },
          orderBy: { order: 'asc' }
        },
        characters: {
          include: {
            character: {
              select: { id: true, name: true, role: true, description: true }
            }
          }
        },
        settings: {
          include: {
            setting: {
              select: { id: true, title: true, category: true, content: true }
            }
          }
        },
        timelines: {
          include: {
            timeline: {
              select: { id: true, name: true, description: true, chronOrder: true, storyDate: true }
            }
          }
        }
      }
    });
    
    if (!plotElement) {
      return res.status(404).json({ error: 'Plot element not found' });
    }
    
    return res.json(plotElement);
  } catch (error: any) {
    console.error('Error fetching plot element:', error);
    return res.status(500).json({ error: 'Failed to fetch plot element' });
  }
});

// POST /api/plot-elements - 创建新情节元素
router.post('/', async (req, res) => {
  try {
    const { 
      projectId, title, type, parentId, summary, content, notes,
      status, targetWords, mood, pov, order, autoCreateChildren 
    } = req.body;
    
    if (!projectId || !title || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, title, type' 
      });
    }
    
    // 如果没有提供order，自动计算
    let elementOrder = order;
    if (elementOrder === undefined) {
      const maxOrder = await prisma.plotElement.findFirst({
        where: { projectId, parentId: parentId || null },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      elementOrder = (maxOrder?.order || 0) + 1;
    }
    
    // 使用事务创建元素和可能的子元素
    const result = await prisma.$transaction(async (tx) => {
      const plotElement = await tx.plotElement.create({
        data: {
          projectId,
          title: title.trim(),
          type,
          order: elementOrder,
          parentId: parentId || null,
          summary: summary || null,
          content: content || '',
          notes: notes || null,
          status: status || 'planned',
          targetWords: targetWords || null,
          mood: mood || null,
          pov: pov || null,
          wordCount: content ? content.length : 0
        },
        include: {
          parent: {
            select: { id: true, title: true, type: true }
          }
        }
      });

      // 自动创建下级元素（除了章节和场景）
      if (autoCreateChildren && type !== 'chapter' && type !== 'scene' && type !== 'beat') {
        const childType = getChildType(type);
        if (childType) {
          const childTitle = getDefaultChildTitle(type, title);
          await tx.plotElement.create({
            data: {
              projectId,
              title: childTitle,
              type: childType,
              order: 1,
              parentId: plotElement.id,
              content: '',
              status: 'planned',
              wordCount: 0
            }
          });
        }
      }

      return plotElement;
    });
    
    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating plot element:', error);
    return res.status(500).json({ error: 'Failed to create plot element' });
  }
});

// 辅助函数：获取子元素类型
function getChildType(parentType: string): string | null {
  switch (parentType) {
    case 'book': return 'part';
    case 'part': return 'chapter';
    case 'chapter': return 'scene';
    default: return null;
  }
}

// 辅助函数：生成默认子元素标题
function getDefaultChildTitle(parentType: string, parentTitle: string): string {
  return '默认标题';
}

// PUT /api/plot-elements/:id - 更新情节元素
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, type, order, parentId, summary, content, notes,
      status, targetWords, mood, pov 
    } = req.body;
    
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (type) updateData.type = type;
    if (order !== undefined) updateData.order = order;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (summary !== undefined) updateData.summary = summary || null;
    if (content !== undefined) {
      updateData.content = content;
      updateData.wordCount = content.length;
    }
    if (notes !== undefined) updateData.notes = notes || null;
    if (status) updateData.status = status;
    if (targetWords !== undefined) updateData.targetWords = targetWords || null;
    if (mood !== undefined) updateData.mood = mood || null;
    if (pov !== undefined) updateData.pov = pov || null;
    
    const plotElement = await prisma.plotElement.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: { id: true, title: true, type: true }
        },
        children: {
          select: { id: true, title: true, type: true, order: true, status: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    
    return res.json(plotElement);
  } catch (error: any) {
    console.error('Error updating plot element:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plot element not found' });
    }
    return res.status(500).json({ error: 'Failed to update plot element' });
  }
});

// DELETE /api/plot-elements/:id - 删除情节元素
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有子元素
    const childrenCount = await prisma.plotElement.count({
      where: { parentId: id }
    });
    
    if (childrenCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete plot element with children. Please delete children first.' 
      });
    }
    
    await prisma.plotElement.delete({
      where: { id }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting plot element:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plot element not found' });
    }
    return res.status(500).json({ error: 'Failed to delete plot element' });
  }
});

// POST /api/plot-elements/:id/characters - 关联角色到情节
router.post('/:id/characters', async (req, res) => {
  try {
    const { id: plotElementId } = req.params;
    const { characterId, role, importance } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ error: 'Missing required field: characterId' });
    }
    
    const relation = await prisma.plotElementCharacter.create({
      data: {
        plotElementId,
        characterId,
        role: role || null,
        importance: importance || 5
      },
      include: {
        character: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    
    return res.status(201).json(relation);
  } catch (error: any) {
    console.error('Error linking character to plot element:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Character already linked to this plot element' });
    }
    return res.status(500).json({ error: 'Failed to link character' });
  }
});

// DELETE /api/plot-elements/:id/characters/:characterId - 取消角色关联
router.delete('/:id/characters/:characterId', async (req, res) => {
  try {
    const { id: plotElementId, characterId } = req.params;
    
    await prisma.plotElementCharacter.delete({
      where: {
        plotElementId_characterId: {
          plotElementId,
          characterId
        }
      }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error unlinking character from plot element:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Character relation not found' });
    }
    return res.status(500).json({ error: 'Failed to unlink character' });
  }
});

// POST /api/plot-elements/:id/settings - 关联设定到情节
router.post('/:id/settings', async (req, res) => {
  try {
    const { id: plotElementId } = req.params;
    const { settingId, relevance } = req.body;
    
    if (!settingId) {
      return res.status(400).json({ error: 'Missing required field: settingId' });
    }
    
    const relation = await prisma.plotElementSetting.create({
      data: {
        plotElementId,
        settingId,
        relevance: relevance || null
      },
      include: {
        setting: {
          select: { id: true, title: true, category: true }
        }
      }
    });
    
    return res.status(201).json(relation);
  } catch (error: any) {
    console.error('Error linking setting to plot element:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Setting already linked to this plot element' });
    }
    return res.status(500).json({ error: 'Failed to link setting' });
  }
});

// DELETE /api/plot-elements/:id/settings/:settingId - 取消设定关联
router.delete('/:id/settings/:settingId', async (req, res) => {
  try {
    const { id: plotElementId, settingId } = req.params;
    
    await prisma.plotElementSetting.delete({
      where: {
        plotElementId_settingId: {
          plotElementId,
          settingId
        }
      }
    });
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error unlinking setting from plot element:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Setting relation not found' });
    }
    return res.status(500).json({ error: 'Failed to unlink setting' });
  }
});

export default router;