import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/timelines/:projectId - 获取项目的所有时间线
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const timelines = await prisma.timeline.findMany({
      where: { projectId },
      include: {
        plotElements: {
          include: {
            plotElement: {
              select: { id: true, title: true, type: true, status: true }
            }
          }
        }
      },
      orderBy: { chronOrder: 'asc' }
    });
    
    res.json(timelines);
  } catch (error) {
    console.error('Error fetching timelines:', error);
    res.status(500).json({ error: 'Failed to fetch timelines' });
  }
});

// GET /api/timelines/detail/:id - 获取单个时间线详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const timeline = await prisma.timeline.findUnique({
      where: { id },
      include: {
        plotElements: {
          include: {
            plotElement: {
              select: { 
                id: true, title: true, type: true, status: true, 
                summary: true, wordCount: true 
              }
            }
          },
          orderBy: {
            plotElement: { order: 'asc' }
          }
        }
      }
    });
    
    if (!timeline) {
      return res.status(404).json({ error: 'Timeline not found' });
    }
    
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// POST /api/timelines - 创建新时间线
router.post('/', async (req, res) => {
  try {
    const { 
      projectId, name, description, storyDate, timeType, 
      chronOrder, importance, duration 
    } = req.body;
    
    if (!projectId || !name || !timeType) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, name, timeType' 
      });
    }
    
    // 如果没有提供chronOrder，自动计算
    let order = chronOrder;
    if (order === undefined) {
      const maxOrder = await prisma.timeline.findFirst({
        where: { projectId },
        orderBy: { chronOrder: 'desc' },
        select: { chronOrder: true }
      });
      order = (maxOrder?.chronOrder || 0) + 1;
    }
    
    const timeline = await prisma.timeline.create({
      data: {
        projectId,
        name: name.trim(),
        description: description || null,
        storyDate: storyDate || null,
        timeType,
        chronOrder: order,
        importance: importance || 5,
        duration: duration || null
      }
    });
    
    res.status(201).json(timeline);
  } catch (error) {
    console.error('Error creating timeline:', error);
    res.status(500).json({ error: 'Failed to create timeline' });
  }
});

// PUT /api/timelines/:id - 更新时间线
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, storyDate, timeType, 
      chronOrder, importance, duration 
    } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;
    if (storyDate !== undefined) updateData.storyDate = storyDate || null;
    if (timeType) updateData.timeType = timeType;
    if (chronOrder !== undefined) updateData.chronOrder = chronOrder;
    if (importance !== undefined) updateData.importance = importance;
    if (duration !== undefined) updateData.duration = duration || null;
    
    const timeline = await prisma.timeline.update({
      where: { id },
      data: updateData
    });
    
    res.json(timeline);
  } catch (error) {
    console.error('Error updating timeline:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Timeline not found' });
    }
    res.status(500).json({ error: 'Failed to update timeline' });
  }
});

// DELETE /api/timelines/:id - 删除时间线
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.timeline.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timeline:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Timeline not found' });
    }
    res.status(500).json({ error: 'Failed to delete timeline' });
  }
});

// POST /api/timelines/:id/plot-elements - 关联情节到时间线
router.post('/:id/plot-elements', async (req, res) => {
  try {
    const { id: timelineId } = req.params;
    const { plotElementId, relationship, description } = req.body;
    
    if (!plotElementId || !relationship) {
      return res.status(400).json({ 
        error: 'Missing required fields: plotElementId, relationship' 
      });
    }
    
    const relation = await prisma.plotElementTimeline.create({
      data: {
        timelineId,
        plotElementId,
        relationship,
        description: description || null
      },
      include: {
        plotElement: {
          select: { id: true, title: true, type: true }
        }
      }
    });
    
    res.status(201).json(relation);
  } catch (error) {
    console.error('Error linking plot element to timeline:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Plot element already linked to this timeline' });
    }
    res.status(500).json({ error: 'Failed to link plot element' });
  }
});

// DELETE /api/timelines/:id/plot-elements/:plotElementId - 取消情节关联
router.delete('/:id/plot-elements/:plotElementId', async (req, res) => {
  try {
    const { id: timelineId, plotElementId } = req.params;
    
    await prisma.plotElementTimeline.delete({
      where: {
        plotElementId_timelineId: {
          plotElementId,
          timelineId
        }
      }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error unlinking plot element from timeline:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plot element relation not found' });
    }
    res.status(500).json({ error: 'Failed to unlink plot element' });
  }
});

// PUT /api/timelines/:id/plot-elements/:plotElementId - 更新情节时间线关系
router.put('/:id/plot-elements/:plotElementId', async (req, res) => {
  try {
    const { id: timelineId, plotElementId } = req.params;
    const { relationship, description } = req.body;
    
    const updateData: any = {};
    if (relationship) updateData.relationship = relationship;
    if (description !== undefined) updateData.description = description || null;
    
    const relation = await prisma.plotElementTimeline.update({
      where: {
        plotElementId_timelineId: {
          plotElementId,
          timelineId
        }
      },
      data: updateData,
      include: {
        plotElement: {
          select: { id: true, title: true, type: true }
        }
      }
    });
    
    res.json(relation);
  } catch (error) {
    console.error('Error updating plot element timeline relation:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Plot element relation not found' });
    }
    res.status(500).json({ error: 'Failed to update relation' });
  }
});

export default router;