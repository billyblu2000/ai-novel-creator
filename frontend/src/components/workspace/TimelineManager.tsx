import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock, AlertTriangle, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Timeline, PlotElement, CreateTimelineData, UpdateTimelineData } from '../../types';
import { timelinesApi, plotElementsApi } from '../../services/api';
import { CreateTimelineModal } from '../CreateTimelineModal';

interface TimelineManagerProps {
  projectId: string;
}

interface TimelineWithPlots extends Timeline {
  plots: PlotElement[];
}

interface SortableTimelineProps {
  timeline: TimelineWithPlots;
  onEdit: (timeline: Timeline) => void;
  onDelete: (timelineId: string) => void;
  getTypeColor: (type: string) => string;
  getTypeText: (type: string) => string;
  getPlotTypeColor: (type: string) => string;
  getPlotTypeText: (type: string) => string;
  onRemoveFromTimeline: (timelineId: string, plotId: string) => void;
}

interface SortablePlotProps {
  id: string;
  plot: PlotElement;
  index: number;
  timelineId: string;
  getPlotTypeColor: (type: string) => string;
  getPlotTypeText: (type: string) => string;
  onRemoveFromTimeline: (timelineId: string, plotId: string) => void;
}

interface UnassignedPlotsAreaProps {
  plots: PlotElement[];
  getPlotTypeColor: (type: string) => string;
  getPlotTypeText: (type: string) => string;
}

const UnassignedPlotsArea: React.FC<UnassignedPlotsAreaProps> = ({
  plots,
  getPlotTypeColor,
  getPlotTypeText
}) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: 'unassigned',
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-xl shadow-sm">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-4 border-b border-yellow-200 dark:border-yellow-700 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">未分配时间线的情节</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">({plots.length} 个)</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">这些情节还没有关联到任何时间线，可以拖拽到时间线中</p>
      </div>
      
      <SortableContext 
        items={plots.map(p => `unassigned-${p.id}`)} 
        strategy={verticalListSortingStrategy}
      >
        <div 
          ref={setNodeRef}
          className={`p-6 min-h-[120px] transition-colors ${
            isOver ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-300 dark:border-yellow-600' : ''
          }`}
        >
          <div className="space-y-3">
            {plots.map((plot, index) => (
              <SortablePlot
                key={plot.id}
                id={`unassigned-${plot.id}`}
                plot={plot}
                index={index}
                timelineId="unassigned"
                getPlotTypeColor={getPlotTypeColor}
                getPlotTypeText={getPlotTypeText}
                onRemoveFromTimeline={() => {}} // 未分配区域不需要移除功能
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </div>
  );
};

const SortablePlot: React.FC<SortablePlotProps> = ({ 
  id, 
  plot, 
  index, 
  timelineId, 
  getPlotTypeColor, 
  getPlotTypeText,
  onRemoveFromTimeline
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 transition-all ${
        isDragging 
          ? 'shadow-lg rotate-1 border-blue-300 dark:border-blue-500 opacity-50' 
          : 'hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">{plot.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlotTypeColor(plot.type)}`}>
                {getPlotTypeText(plot.type)}
              </span>
            </div>
            {timelineId !== 'unassigned' && (
              <button
                onClick={() => onRemoveFromTimeline(timelineId, plot.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="从时间线中移除"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {plot.summary && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{plot.summary}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {plot.wordCount > 0 && (
              <span>{plot.wordCount.toLocaleString()} 字</span>
            )}
            {plot.status && (
              <span>状态: {plot.status}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SortableTimeline: React.FC<SortableTimelineProps> = ({
  timeline,
  onEdit,
  onDelete,
  getTypeColor,
  getTypeText,
  getPlotTypeColor,
  getPlotTypeText,
  onRemoveFromTimeline
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: timeline.id });

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: timeline.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all ${
        isDragging 
          ? 'shadow-lg rotate-1 border-blue-300 dark:border-blue-500 opacity-50' 
          : ''
      }`}
    >
      {/* 时间线标题区域 */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{timeline.name}</h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(timeline.timeType)}`}>
                  {getTypeText(timeline.timeType)}
                </span>
                {timeline.storyDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{timeline.storyDate}</span>
                )}
                {timeline.duration && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">持续: {timeline.duration}</span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {timeline.plots.length} 个情节
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onEdit(timeline)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(timeline.id)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {timeline.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 ml-8">{timeline.description}</p>
        )}
      </div>

      {/* 情节列表区域 */}
      <div 
        ref={setDroppableRef}
        className={`p-6 min-h-[120px] transition-colors ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600' : ''
        }`}
      >
        {timeline.plots.length > 0 ? (
          <SortableContext 
            items={timeline.plots.map(p => `${timeline.id}-${p.id}`)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {timeline.plots.map((plot, index) => (
                <SortablePlot
                  key={plot.id}
                  id={`${timeline.id}-${plot.id}`}
                  plot={plot}
                  index={index}
                  timelineId={timeline.id}
                  getPlotTypeColor={getPlotTypeColor}
                  getPlotTypeText={getPlotTypeText}
                  onRemoveFromTimeline={onRemoveFromTimeline}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>该时间线下还没有关联的情节</p>
            <p className="text-xs mt-1">将情节拖拽到这里来添加到时间线</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const TimelineManager: React.FC<TimelineManagerProps> = ({ projectId }) => {
  const [timelines, setTimelines] = useState<TimelineWithPlots[]>([]);
  const [unassignedPlots, setUnassignedPlots] = useState<PlotElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedTimeline, setDraggedTimeline] = useState<TimelineWithPlots | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTimelineData();
  }, [projectId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      
      // 加载时间线
      const timelinesData = await timelinesApi.getByProject(projectId);
      
      // 加载所有情节元素（只获取叶节点）
      const allPlotElements = await plotElementsApi.getByProject(projectId);
      const leafPlots = allPlotElements.filter(plot => 
        plot.type === 'scene' || 
        !allPlotElements.some(p => p.parentId === plot.id)
      );

      // 构建时间线数据结构
      const timelinesWithPlots: TimelineWithPlots[] = timelinesData
        .sort((a, b) => a.chronOrder - b.chronOrder)
        .map(timeline => ({
          ...timeline,
          plots: timeline.plotElements 
            ? timeline.plotElements
                .map(pe => pe.plotElement!)
                .filter(Boolean)
            : []
        }));

      // 找出未分配的情节
      const assignedPlotIds = new Set(
        timelinesWithPlots.flatMap(t => t.plots.map(p => p.id))
      );
      const unassigned = leafPlots.filter(plot => !assignedPlotIds.has(plot.id));

      setTimelines(timelinesWithPlots);
      setUnassignedPlots(unassigned);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineSubmit = async (data: CreateTimelineData | UpdateTimelineData, isEdit?: boolean) => {
    try {
      if (isEdit && editingTimeline) {
        await timelinesApi.update(editingTimeline.id, data as UpdateTimelineData);
        setEditingTimeline(null);
      } else {
        // 新创建的时间线设置为最前面（chronOrder = 0）
        // 其他时间线的chronOrder会在后端自动调整
        const createData = { ...data as CreateTimelineData, chronOrder: 0 };
        await timelinesApi.create(createData);
      }
      await loadTimelineData();
    } catch (error) {
      console.error('Error saving timeline:', error);
      throw error;
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    try {
      await timelinesApi.delete(timelineId);
      await loadTimelineData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting timeline:', error);
    }
  };

  const handleRemoveFromTimeline = async (timelineId: string, plotId: string) => {
    const plot = findPlotById(plotId);
    if (!plot) return;

    // 乐观更新：立即更新本地状态
    optimisticMovePlotBetweenTimelines(plot, timelineId, 'unassigned');

    // 后台更新服务器
    try {
      await timelinesApi.unlinkPlotElement(timelineId, plotId);
    } catch (error) {
      console.error('Error removing plot from timeline:', error);
      // 如果更新失败，恢复原始状态
      await loadTimelineData();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    
    const timeline = timelines.find(t => t.id === active.id);
    setDraggedTimeline(timeline || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedTimeline(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 检查是否是时间线拖拽
    if (!activeId.includes('-') && !overId.includes('-')) {
      // 时间线拖拽
      const oldIndex = timelines.findIndex(t => t.id === activeId);
      const newIndex = timelines.findIndex(t => t.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      // 乐观更新：立即更新本地状态
      const newTimelines = arrayMove(timelines, oldIndex, newIndex);
      setTimelines(newTimelines);

      // 后台更新服务器
      try {
        const updatePromises = newTimelines.map((timeline, index) => 
          timelinesApi.update(timeline.id, { chronOrder: index })
        );
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error updating timeline order:', error);
        // 如果更新失败，恢复原始状态
        await loadTimelineData();
      }
    } else if (activeId.includes('-')) {
      // 情节拖拽
      const [activeTimelineId, activePlotId] = activeId.split('-');
      
      // 检查目标是时间线还是情节
      if (overId.includes('-')) {
        // 拖拽到另一个情节上
        const [overTimelineId, overPlotId] = overId.split('-');

        if (activeTimelineId === overTimelineId) {
          // 同一时间线内重排序
          const timeline = timelines.find(t => t.id === activeTimelineId);
          if (!timeline) return;

          const oldIndex = timeline.plots.findIndex(p => p.id === activePlotId);
          const newIndex = timeline.plots.findIndex(p => p.id === overPlotId);

          if (oldIndex === -1 || newIndex === -1) return;

          // 乐观更新：立即更新本地状态
          const newPlots = arrayMove(timeline.plots, oldIndex, newIndex);
          setTimelines(prev => prev.map(t => 
            t.id === activeTimelineId 
              ? { ...t, plots: newPlots }
              : t
          ));

          // TODO: 这里需要后端API支持更新情节在时间线中的顺序
          console.log('Plot reordering within timeline:', { activeTimelineId, activePlotId, overPlotId, oldIndex, newIndex });
        } else {
          // 跨时间线移动情节
          const activePlot = findPlotById(activePlotId);
          if (!activePlot) return;

          // 乐观更新：立即更新本地状态
          optimisticMovePlotBetweenTimelines(activePlot, activeTimelineId, overTimelineId);

          // 后台更新服务器
          try {
            if (activeTimelineId !== 'unassigned') {
              await timelinesApi.unlinkPlotElement(activeTimelineId, activePlotId);
            }
            if (overTimelineId !== 'unassigned') {
              await timelinesApi.linkPlotElement(overTimelineId, activePlotId, 'main', '');
            }
          } catch (error) {
            console.error('Error moving plot between timelines:', error);
            // 如果更新失败，恢复原始状态
            await loadTimelineData();
          }
        }
      } else {
        // 拖拽到时间线上（空白区域）
        const targetTimelineId = overId;
        const activePlot = findPlotById(activePlotId);
        if (!activePlot) return;

        // 乐观更新：立即更新本地状态
        optimisticMovePlotBetweenTimelines(activePlot, activeTimelineId, targetTimelineId);

        // 后台更新服务器
        try {
          if (activeTimelineId !== 'unassigned') {
            await timelinesApi.unlinkPlotElement(activeTimelineId, activePlotId);
          }
          if (targetTimelineId !== 'unassigned') {
            await timelinesApi.linkPlotElement(targetTimelineId, activePlotId, 'main', '');
          }
        } catch (error) {
          console.error('Error moving plot to timeline:', error);
          // 如果更新失败，恢复原始状态
          await loadTimelineData();
        }
      }
    }
  };

  // 辅助函数：根据ID查找情节
  const findPlotById = (plotId: string): PlotElement | null => {
    // 在时间线中查找
    for (const timeline of timelines) {
      const plot = timeline.plots.find(p => p.id === plotId);
      if (plot) return plot;
    }
    // 在未分配情节中查找
    const plot = unassignedPlots.find(p => p.id === plotId);
    return plot || null;
  };

  // 乐观更新：在时间线之间移动情节
  const optimisticMovePlotBetweenTimelines = (
    plot: PlotElement, 
    fromTimelineId: string, 
    toTimelineId: string
  ) => {
    // 从原位置移除
    if (fromTimelineId === 'unassigned') {
      setUnassignedPlots(prev => prev.filter(p => p.id !== plot.id));
    } else {
      setTimelines(prev => prev.map(t => 
        t.id === fromTimelineId 
          ? { ...t, plots: t.plots.filter(p => p.id !== plot.id) }
          : t
      ));
    }

    // 添加到新位置
    if (toTimelineId === 'unassigned') {
      setUnassignedPlots(prev => [...prev, plot]);
    } else {
      setTimelines(prev => prev.map(t => 
        t.id === toTimelineId 
          ? { ...t, plots: [...t.plots, plot] }
          : t
      ));
    }
  };

  const filteredTimelines = timelines.filter(timeline => {
    const matchesSearch = timeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (timeline.description && timeline.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || timeline.timeType === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'absolute': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'relative': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'symbolic': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'absolute': return '绝对时间';
      case 'relative': return '相对时间';
      case 'symbolic': return '象征时间';
      default: return type;
    }
  };

  const getPlotTypeColor = (type: string) => {
    switch (type) {
      case 'chapter': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'scene': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getPlotTypeText = (type: string) => {
    switch (type) {
      case 'chapter': return '章节';
      case 'scene': return '场景';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">时间线管理</h2>
          <p className="text-gray-600 dark:text-gray-400">管理故事的时间轴和重要事件</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加时间线</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索时间线..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full"
          >
            <option value="all">所有类型</option>
            <option value="absolute">绝对时间</option>
            <option value="relative">相对时间</option>
            <option value="symbolic">象征时间</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {filteredTimelines.length === 0 && unassignedPlots.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">还没有时间线内容</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">创建时间线并将情节关联到时间线上，就能在这里看到时间组织的故事结构</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            创建时间线
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-8">
            {/* 时间线列表 */}
            <SortableContext 
              items={filteredTimelines.map(t => t.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {filteredTimelines.map((timeline) => (
                  <SortableTimeline
                    key={timeline.id}
                    timeline={timeline}
                    onEdit={setEditingTimeline}
                    onDelete={setShowDeleteConfirm}
                    getTypeColor={getTypeColor}
                    getTypeText={getTypeText}
                    getPlotTypeColor={getPlotTypeColor}
                    getPlotTypeText={getPlotTypeText}
                    onRemoveFromTimeline={handleRemoveFromTimeline}
                  />
                ))}
              </div>
            </SortableContext>

            {/* 未分配情节区域 */}
            {unassignedPlots.length > 0 && (
              <UnassignedPlotsArea 
                plots={unassignedPlots}
                getPlotTypeColor={getPlotTypeColor}
                getPlotTypeText={getPlotTypeText}
              />
            )}
          </div>

          {/* 拖拽覆盖层 */}
          <DragOverlay>
            {activeId && draggedTimeline ? (
              <div className="bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-500 rounded-xl shadow-lg rotate-1 opacity-90">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{draggedTimeline.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(draggedTimeline.timeType)}`}>
                          {getTypeText(draggedTimeline.timeType)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {draggedTimeline.plots.length} 个情节
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* 创建/编辑时间线模态框 */}
      <CreateTimelineModal
        isOpen={showCreateModal || !!editingTimeline}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTimeline(null);
        }}
        onSubmit={handleTimelineSubmit}
        timeline={editingTimeline}
        projectId={projectId}
      />

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">删除时间线</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">此操作无法撤销</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                确定要删除这条时间线吗？关联的情节将会被移到未分配区域。
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteTimeline(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  删除时间线
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};