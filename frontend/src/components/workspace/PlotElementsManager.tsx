import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, ChevronRight, ChevronDown, Expand, Minimize2 } from 'lucide-react';
import type { PlotElement } from '../../types';
import { plotElementsApi } from '../../services/api';

interface PlotElementsManagerProps {
  projectId: string;
}

export const PlotElementsManager: React.FC<PlotElementsManagerProps> = ({ projectId }) => {
  const [plotElements, setPlotElements] = useState<PlotElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [, setShowCreateModal] = useState(false);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'text-purple-600 bg-purple-100';
      case 'part': return 'text-blue-600 bg-blue-100';
      case 'chapter': return 'text-green-600 bg-green-100';
      case 'scene': return 'text-yellow-600 bg-yellow-100';
      case 'beat': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'book': return '书';
      case 'part': return '部';
      case 'chapter': return '章';
      case 'scene': return '场景';
      case 'beat': return '节拍';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-gray-600 bg-gray-100';
      case 'outlined': return 'text-yellow-600 bg-yellow-100';
      case 'drafted': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const renderPlotElement = (element: PlotElement, level: number = 0) => {
    const hasChildren = element.children && element.children.length > 0;
    const isExpanded = expandedItems.has(element.id);
    
    // 根据重要程度确定背景色（保持原有系统）
    const getImportanceBackground = (importance: number = 5) => {
      if (importance >= 8) return 'bg-gray-100';
      if (importance >= 6) return 'bg-slate-50';
      if (importance >= 4) return 'bg-gray-50';
      return 'bg-white';
    };
    
    // 根据层级确定样式（不使用背景色）
    const getLevelStyles = (level: number) => {
      const baseStyles = "border-2 border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer";
      
      switch (level) {
        case 0: // 书级别
          return `${baseStyles} p-6 shadow-sm border-gray-300`;
        case 1: // 部级别  
          return `${baseStyles} p-5 ml-6 border-l-4 border-l-blue-500`;
        case 2: // 章级别
          return `${baseStyles} p-4 ml-12 border-l-4 border-l-green-500`;
        case 3: // 场景级别
          return `${baseStyles} p-3 ml-18 border-l-4 border-l-yellow-500`;
        default: // 更深层级
          return `${baseStyles} p-3 ml-24 border-l-4 border-l-gray-500`;
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

    return (
      <div key={element.id} className="mb-3">
        <div className={`${getLevelStyles(level)} ${getImportanceBackground(1)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(element.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                )}
                <span className="text-lg">{getTypeIcon(element.type)}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`font-semibold text-gray-900 ${level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-base'}`}>
                    {element.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(element.type)}`}>
                    {getTypeText(element.type)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(element.status)}`}>
                    {getStatusText(element.status)}
                  </span>
                </div>
                
                {element.summary && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {element.summary}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-4 space-y-3">
            {element.children!.map((child) => 
              renderPlotElement(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const hierarchicalElements = buildHierarchy(plotElements);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">情节大纲</h2>
          <p className="text-gray-600">组织和管理你的故事结构</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加情节</span>
        </button>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white w-full"
            >
              <option value="all">所有类型</option>
              <option value="book">书</option>
              <option value="part">部</option>
              <option value="chapter">章</option>
              <option value="scene">场景</option>
              <option value="beat">节拍</option>
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
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Expand className="w-4 h-4" />
            <span>展开全部</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有情节大纲</h3>
          <p className="text-gray-600 mb-4">开始构建你的故事结构吧</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            创建第一个情节
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {hierarchicalElements.map((element) => 
            renderPlotElement(element, 0)
          )}
        </div>
      )}
    </div>
  );
};