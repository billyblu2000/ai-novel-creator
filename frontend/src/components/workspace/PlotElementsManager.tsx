import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookOpen, ChevronRight, ChevronDown, Expand, Minimize2, PenTool } from 'lucide-react';
import type { PlotElement, Project } from '../../types';
import { plotElementsApi } from '../../services/api';
import { EditPlotElementModal } from '../EditPlotElementModal';
import { DraggablePlotElement } from './DraggablePlotElement';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface PlotElementsManagerProps {
  projectId: string;
  project: Project;
}

export const PlotElementsManager: React.FC<PlotElementsManagerProps> = ({ projectId, project }) => {
  const navigate = useNavigate();
  const [plotElements, setPlotElements] = useState<PlotElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [elementToEdit, setElementToEdit] = useState<PlotElement | null>(null);
  const [creatingElements, setCreatingElements] = useState<Set<string>>(new Set());
  const [isDragMode, setIsDragMode] = useState(false);

  useEffect(() => {
    loadPlotElements();
  }, [projectId]);

  const loadPlotElements = async () => {
    try {
      setLoading(true);
      const data = await plotElementsApi.getByProject(projectId);
      setPlotElements(data);
    } catch (error) {
      console.error('Error loading plot elements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditElement = (element: PlotElement) => {
    setElementToEdit(element);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    loadPlotElements(); // 重新加载数据
    setElementToEdit(null);
  };

  const buildHierarchy = (elements: PlotElement[]): (PlotElement & { children: PlotElement[] })[] => {
    const elementMap = new Map<string, PlotElement & { children: PlotElement[] }>();
    const rootElements: (PlotElement & { children: PlotElement[] })[] = [];

    // 初始化所有元素
    elements.forEach(el => {
      elementMap.set(el.id, { ...el, children: [] });
    });

    // 构建层级关系
    elements.forEach(element => {
      const el = elementMap.get(element.id)!;
      if (element.parentId && elementMap.has(element.parentId)) {
        const parent = elementMap.get(element.parentId)!;
        parent.children.push(el);
      } else {
        rootElements.push(el);
      }
    });

    // Sort by order
    const sortByOrder = (items: PlotElement[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children) {
          sortByOrder(item.children);
        }
      });
    };

    sortByOrder(rootElements);
    return rootElements;
  };

  // 构建简化视图的层级结构
  const buildSimplifiedHierarchy = (elements: PlotElement[]): (PlotElement & { children: PlotElement[] })[] => {
    const chapters = elements.filter(el => el.type === 'chapter');
    const scenes = elements.filter(el => el.type === 'scene');
    
    return chapters.map(chapter => ({
      ...chapter,
      children: scenes.filter(scene => scene.parentId === chapter.id).sort((a, b) => a.order - b.order)
    })).sort((a, b) => a.order - b.order);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (elements: PlotElement[]) => {
      elements.forEach(el => {
        if (el.children && el.children.length > 0) {
          allIds.add(el.id);
          collectIds(el.children);
        }
      });
    };
    collectIds(hierarchicalElements);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // 直接创建元素，无弹窗
  const handleCreateElement = async (type: string, parentElement?: PlotElement) => {
    const loadingKey = `${type}-${parentElement?.id || 'root'}`;
    
    // 添加loading状态
    setCreatingElements(prev => new Set(prev).add(loadingKey));
    
    const defaultTitle = getDefaultTitle();
    
    // 在简化视图中创建章节时，需要找到默认的卷作为父元素
    let actualParentId = parentElement?.id;
    if (project.plotViewMode === 'simplified' && type === 'chapter' && !parentElement) {
      // 查找默认的卷（part）
      const defaultPart = plotElements.find(el => el.type === 'part');
      if (defaultPart) {
        actualParentId = defaultPart.id;
      }
    }
    
    // 乐观更新：立即添加临时元素到列表
    const tempElement: PlotElement = {
        id: `temp-${Date.now()}`,
        projectId: project.id,
        title: defaultTitle,
        type: type as any,
        order: getNextOrder(type, actualParentId),
        parentId: actualParentId,
        summary: undefined,
        content: '',
        notes: undefined,
        status: 'planned',
        wordCount: 0,
        targetWords: undefined,
        mood: undefined,
        pov: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: []
      };
      
      // 立即更新UI
      setPlotElements(prev => [...prev, tempElement]);
      
      // 如果有父元素，自动展开它
      if (parentElement) {
        setExpandedItems(prev => new Set(prev).add(parentElement.id));
      }
      
      try {
        // 实际创建元素
        const newElement = await plotElementsApi.create({
          projectId: project.id,
          title: defaultTitle,
          type: type as any,
          parentId: actualParentId,
          status: 'planned',
          autoCreateChildren: true
        });
        
        // 乐观更新：用真实数据替换临时元素
        setPlotElements(prev => prev.map(el => 
          el.id === tempElement.id ? newElement : el
        ));
      } catch (error) {
        console.error('Error creating plot element:', error);
        alert('创建失败，请稍后重试');
        // 失败时移除临时元素
        setPlotElements(prev => prev.filter(el => el.id !== tempElement.id));
      } finally {
        // 移除loading状态
        setCreatingElements(prev => {
          const newSet = new Set(prev);
          newSet.delete(loadingKey);
          return newSet;
        });
      }
  };

  // 获取下一个排序号
  const getNextOrder = (type: string, parentId?: string) => {
    const siblings = plotElements.filter(el => 
      el.type === type && el.parentId === (parentId || null)
    );
    return siblings.length + 1;
  };

  const handleDeleteElement = async (element: PlotElement) => {
    const hasChildren = element.children && element.children.length > 0;
    const confirmMessage = hasChildren 
      ? `确定要删除"${element.title}"吗？\n\n⚠️ 注意：这将同时删除所有子元素（${element.children?.length}个），此操作不可撤销！`
      : `确定要删除"${element.title}"吗？`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // 保存原始数据以便回滚
    const originalElements = [...plotElements];
    
    // 乐观更新：立即从UI中移除元素及其所有子元素
    const removeElementAndChildren = (elements: PlotElement[], targetId: string): PlotElement[] => {
      return elements.filter(el => {
        if (el.id === targetId) return false;
        if (el.parentId === targetId) return false;
        // 递归检查是否是要删除元素的后代
        const isDescendant = (parentId: string | undefined): boolean => {
          if (!parentId) return false;
          if (parentId === targetId) return true;
          const parent = elements.find(p => p.id === parentId);
          return parent ? isDescendant(parent.parentId) : false;
        };
        return !isDescendant(el.parentId);
      });
    };
    
    setPlotElements(prev => removeElementAndChildren(prev, element.id));

    try {
      await plotElementsApi.delete(element.id);
      // 删除成功，不需要额外操作，UI已经更新
    } catch (error) {
      console.error('Error deleting plot element:', error);
      alert('删除失败，请稍后重试');
      // 失败时回滚到原始状态
      setPlotElements(originalElements);
    }
  };

  // 生成默认标题（不包含顺序信息）
  const getDefaultTitle = () => {
    return '默认标题';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
      case 'part': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'chapter': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'scene': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'beat': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    const levelNames = project.levelNames;
    switch (type) {
      case 'book': return levelNames.book;
      case 'part': return levelNames.part;
      case 'chapter': return levelNames.chapter;
      case 'scene': return levelNames.scene;
      case 'beat': return '节拍';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      case 'outlined': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'drafted': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return '计划中';
      case 'outlined': return '已大纲';
      case 'drafted': return '草稿';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  const getChildTypeLabel = (parentType: string) => {
    switch (parentType) {
      case 'book': return project.levelNames.part;
      case 'part': return project.levelNames.chapter;
      case 'chapter': return project.levelNames.scene;
      case 'scene': return '节拍';
      default: return '子元素';
    }
  };

  const getChildType = (parentType: string) => {
    switch (parentType) {
      case 'book': return 'part';
      case 'part': return 'chapter';
      case 'chapter': return 'scene';
      case 'scene': return 'beat';
      default: return null;
    }
  };

  // 生成带顺序的显示标题
  const getDisplayTitle = (element: PlotElement) => {
    let typeLabel = '';
    switch (element.type) {
      case 'book': 
        typeLabel = '书';
        break;
      case 'part': 
        typeLabel = '卷';
        break;
      case 'chapter': 
        typeLabel = '章节';
        break;
      case 'scene': 
        typeLabel = '场景';
        break;
      case 'beat': 
        typeLabel = '节拍';
        break;
      default: 
        typeLabel = element.type;
    }
    return `${typeLabel}#${element.order}: 「${element.title}」`;
  };

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeElement = plotElements.find(el => el.id === active.id);
    const overElement = plotElements.find(el => el.id === over.id);

    if (!activeElement || !overElement) {
      return;
    }

    // 只允许同级元素之间拖拽
    if (activeElement.parentId !== overElement.parentId) {
      return;
    }

    // 获取同级元素
    const siblings = plotElements.filter(el => 
      el.parentId === activeElement.parentId && el.type === activeElement.type
    ).sort((a, b) => a.order - b.order);

    const oldIndex = siblings.findIndex(el => el.id === active.id);
    const newIndex = siblings.findIndex(el => el.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 乐观更新：立即更新UI
    const newSiblings = arrayMove(siblings, oldIndex, newIndex);
    const updatedElements = plotElements.map(el => {
      const newSibling = newSiblings.find(s => s.id === el.id);
      if (newSibling) {
        const newOrder = newSiblings.indexOf(newSibling) + 1;
        return { ...el, order: newOrder };
      }
      return el;
    });

    setPlotElements(updatedElements);

    // 后台更新顺序
    try {
      // 批量更新所有受影响元素的顺序
      const updatePromises = newSiblings.map((element, index) => 
        plotElementsApi.update(element.id, { order: index + 1 })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating element order:', error);
      // 失败时重新加载数据
      await loadPlotElements();
    }
  };

  const renderPlotElement = (element: PlotElement, level: number = 0, isSimplified: boolean = false) => {
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedItems.has(element.id);
    
    // 根据重要程度确定背景色（保持原有系统）
    const getImportanceBackground = (importance: number = 5) => {
      if (importance >= 8) return 'bg-gray-100 dark:bg-gray-800';
      if (importance >= 6) return 'bg-slate-50 dark:bg-slate-800';
      if (importance >= 4) return 'bg-gray-50 dark:bg-gray-850';
      return 'bg-white dark:bg-gray-900';
    };
    
    // 根据层级确定样式
    const getLevelStyles = (level: number, isSimplified: boolean) => {
      const baseStyles = "border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-black dark:hover:border-white hover:shadow-md transition-all duration-200 cursor-pointer";
      
      if (isSimplified) {
        // 简化视图样式
        switch (level) {
          case 0: // 章级别（在简化视图中是顶级）
            return `${baseStyles} p-5 shadow-sm border-gray-300 dark:border-gray-600`;
          case 1: // 场景级别
            return `${baseStyles} p-4 ml-6 border-l-4 border-l-yellow-500`;
          default:
            return `${baseStyles} p-3 ml-12`;
        }
      } else {
        // 完整视图样式
        switch (level) {
          case 0: // 书级别
            return `${baseStyles} p-6 shadow-sm border-gray-300 dark:border-gray-600`;
          case 1: // 部级别  
            return `${baseStyles} p-5 ml-6 border-l-4 border-l-blue-500`;
          case 2: // 章级别
            return `${baseStyles} p-4 ml-12 border-l-4 border-l-green-500`;
          case 3: // 场景级别
            return `${baseStyles} p-3 ml-18 border-l-4 border-l-yellow-500`;
          default: // 更深层级
            return `${baseStyles} p-3 ml-24 border-l-4 border-l-gray-500`;
        }
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'book': return '📚';
        case 'part': return '📖';
        case 'chapter': return '📄';
        case 'scene': return '🎬';
        case 'beat': return '🎵';
        default: return '📝';
      }
    };

    const elementContent = (
      <div className={`${getLevelStyles(level, isSimplified)} ${getImportanceBackground(1)}`}>
        <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(element.id)}
                    className="p-1 hover:bg-white dark:hover:bg-gray-700 hover:bg-opacity-50 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                )}
                <span className="text-lg">{getTypeIcon(element.type)}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`font-semibold text-gray-900 dark:text-white ${level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-base'}`}>
                    {getDisplayTitle(element)}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(element.type)}`}>
                    {getTypeText(element.type)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(element.status)}`}>
                    {getStatusText(element.status)}
                  </span>
                </div>
                
                {element.summary && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {element.summary}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  {element.wordCount > 0 && (
                    <span>{element.wordCount.toLocaleString()} 字</span>
                  )}
                  {element.targetWords && (
                    <span>目标: {element.targetWords.toLocaleString()} 字</span>
                  )}
                  {element.mood && (
                    <span>基调: {element.mood}</span>
                  )}
                  {element.pov && (
                    <span>视角: {element.pov}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* 添加子元素按钮 */}
              {(() => {
                // 简化视图逻辑
                if (project.plotViewMode === 'simplified') {
                  if (element.type === 'chapter') {
                    const loadingKey = `scene-${element.id}`;
                    const isLoading = creatingElements.has(loadingKey);
                    return (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateElement('scene', element);
                        }}
                        disabled={isLoading}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`添加${project.levelNames.scene}`}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    );
                  }
                  return null;
                }
                
                // 完整视图逻辑
                if (element.type !== 'scene' && element.type !== 'beat') {
                  const childType = getChildType(element.type);
                  if (childType) {
                    const loadingKey = `${childType}-${element.id}`;
                    const isLoading = creatingElements.has(loadingKey);
                    return (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateElement(childType, element);
                        }}
                        disabled={isLoading}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`添加${getChildTypeLabel(element.type)}`}
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    );
                  }
                }
                return null;
              })()}
              
              {/* 编辑内容按钮 */}
              {(element.type === 'chapter' || element.type === 'scene') && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${projectId}/edit/${element.id}`);
                  }}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="编辑内容"
                >
                  <PenTool className="w-4 h-4" />
                </button>
              )}
              
              {/* 编辑属性按钮 */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditElement(element);
                }}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="编辑属性"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              {/* 删除按钮 */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteElement(element);
                }}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
    );

    return (
      <div key={element.id} className="mb-3">
        <DraggablePlotElement element={element} isDragMode={isDragMode}>
          {elementContent}
        </DraggablePlotElement>
        
        {hasChildren && isExpanded && (
          <SortableContext 
            items={element.children!.map(child => child.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-4 space-y-3">
              {element.children!.map((child) => 
                renderPlotElement(child, level + 1, isSimplified)
              )}
            </div>
          </SortableContext>
        )}
      </div>
    );
  };

  const hierarchicalElements = project.plotViewMode === 'simplified' 
    ? buildSimplifiedHierarchy(plotElements)
    : buildHierarchy(plotElements);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">情节大纲</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {project.plotViewMode === 'simplified' 
              ? `管理你的${project.levelNames.chapter}和${project.levelNames.scene}` 
              : '组织和管理你的故事结构'
            }
          </p>
          {project.plotViewMode === 'simplified' && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              💡 当前为简化视图，只显示{project.levelNames.chapter}层级。可在项目设置中切换到完整视图。
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* 拖拽模式切换开关 */}
          <button
            onClick={() => setIsDragMode(!isDragMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              isDragMode 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="text-sm">{isDragMode ? '拖拽模式' : '调整顺序'}</span>
          </button>
          
          <button
            onClick={() => {
              if (project.plotViewMode === 'simplified') {
                handleCreateElement('chapter');
              } else {
                handleCreateElement('book');
              }
            }}
            disabled={creatingElements.has(project.plotViewMode === 'simplified' ? 'chapter-root' : 'book-root')}
            className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingElements.has(project.plotViewMode === 'simplified' ? 'chapter-root' : 'book-root') ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>
              {project.plotViewMode === 'simplified' 
                ? `新建${project.levelNames.chapter}` 
                : `新建${project.levelNames.book}`
              }
            </span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索情节..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
            >
              <option value="all">所有类型</option>
              {project.plotViewMode === 'complete' && (
                <>
                  <option value="book">{project.levelNames.book}</option>
                  <option value="part">{project.levelNames.part}</option>
                </>
              )}
              <option value="chapter">{project.levelNames.chapter}</option>
              <option value="scene">{project.levelNames.scene}</option>
              {project.plotViewMode === 'complete' && (
                <option value="beat">节拍</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Expand/Collapse Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={expandAll}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Expand className="w-4 h-4" />
            <span>展开全部</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            <span>折叠全部</span>
          </button>
        </div>
      </div>

      {/* Plot Elements Tree */}
      {hierarchicalElements.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {project.plotViewMode === 'simplified' 
              ? `还没有${project.levelNames.chapter}` 
              : '还没有情节大纲'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {project.plotViewMode === 'simplified' 
              ? `开始创建你的第一个${project.levelNames.chapter}吧` 
              : '开始构建你的故事结构吧'
            }
          </p>
          <button
            onClick={() => {
              if (project.plotViewMode === 'simplified') {
                handleCreateElement('chapter');
              } else {
                handleCreateElement('book');
              }
            }}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {project.plotViewMode === 'simplified' 
              ? `创建第一个${project.levelNames.chapter}` 
              : '创建第一个情节'
            }
          </button>
        </div>
      ) : isDragMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={hierarchicalElements.map(element => element.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {hierarchicalElements.map((element) => 
                renderPlotElement(element, 0, project.plotViewMode === 'simplified')
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {hierarchicalElements.map((element) => 
            renderPlotElement(element, 0, project.plotViewMode === 'simplified')
          )}
        </div>
      )}

      {/* 编辑情节元素Modal */}
      <EditPlotElementModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setElementToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        project={project}
        element={elementToEdit}
      />
    </div>
  );
};