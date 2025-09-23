import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock } from 'lucide-react';
import type { Timeline } from '../../types';
import { timelinesApi } from '../../services/api';

interface TimelineManagerProps {
  projectId: string;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({ projectId }) => {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [plotElements, setPlotElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTimelineData();
  }, [projectId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      // 加载时间线
      const timelinesData = await timelinesApi.getByProject(projectId);
      setTimelines(timelinesData.sort((a, b) => a.chronOrder - b.chronOrder));
      
      // 加载情节元素
      const response = await fetch(`http://localhost:3001/api/plot-elements/${projectId}`);
      const plotsData = await response.json();
      setPlotElements(plotsData);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取叶节点情节（没有子节点的情节）
  const getLeafPlotElements = (plots: any[]): any[] => {
    return plots.filter(plot => !plot.children || plot.children.length === 0);
  };

  // 按时间线分组情节 - 从时间线数据中提取关联的情节
  const groupPlotsByTimeline = () => {
    const grouped: { [key: string]: any[] } = {};
    const unassigned: any[] = [];

    // 从时间线数据中提取情节
    timelines.forEach(timeline => {
      if (timeline.plotElements && timeline.plotElements.length > 0) {
        grouped[timeline.id] = timeline.plotElements.map(pe => pe.plotElement);
      }
    });

    // 获取所有叶节点情节
    const leafPlots = getLeafPlotElements(plotElements);
    
    // 找出未分配到任何时间线的情节
    leafPlots.forEach(plot => {
      let isAssigned = false;
      Object.values(grouped).forEach(timelinePlots => {
        if (timelinePlots.some(tp => tp.id === plot.id)) {
          isAssigned = true;
        }
      });
      if (!isAssigned) {
        unassigned.push(plot);
      }
    });

    return { grouped, unassigned };
  };

  const { grouped: groupedPlots, unassigned: unassignedPlots } = groupPlotsByTimeline();

  const filteredTimelines = timelines.filter(timeline => {
    const matchesSearch = timeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (timeline.description && timeline.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || timeline.timeType === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'absolute': return 'text-blue-600 bg-blue-100';
      case 'relative': return 'text-green-600 bg-green-100';
      case 'symbolic': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
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
      <div className="bg-white pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">时间线管理</h2>
            <p className="text-gray-600">管理故事的时间轴和重要事件</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加时间线</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索时间线..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-md focus:border-black focus:outline-none transition-colors"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-md focus:border-black focus:outline-none transition-colors appearance-none bg-white pr-8"
          >
            <option value="all">所有类型</option>
            <option value="absolute">绝对时间</option>
            <option value="relative">相对时间</option>
            <option value="symbolic">象征时间</option>
          </select>
        </div>
      </div>

      {filteredTimelines.length === 0 && unassignedPlots.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有时间线内容</h3>
          <p className="text-gray-600 mb-6">创建时间线并将情节关联到时间线上，就能在这里看到时间组织的故事结构</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            创建时间线
          </button>
        </div>
      ) : (
        <>
          {/* 时间线区域 */}
          <div className="relative">
            {/* 时间线内容容器 */}
            <div className="space-y-8 relative">
              {/* 垂直时间轴线 - 只覆盖时间线区域 */}
              {filteredTimelines.length > 1 && (
                <div 
                  className="absolute left-1/2 top-0 w-0.5 bg-gray-300 transform -translate-x-1/2" 
                  style={{ height: `calc(100% - 2rem)` }}
                ></div>
              )}

              {filteredTimelines.map((timeline, index) => (
                <div key={timeline.id} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* 时间轴节点 */}
                  {filteredTimelines.length > 1 && (
                    <div className="absolute left-1/2 top-8 w-4 h-4 bg-black rounded-full border-4 border-white shadow-lg transform -translate-x-1/2"></div>
                  )}
                  
                  {/* 时间线标题区域 */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{timeline.name}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(timeline.timeType)}`}>
                              {getTypeText(timeline.timeType)}
                            </span>
                            {timeline.storyDate && (
                              <span className="text-sm text-gray-500">{timeline.storyDate}</span>
                            )}
                            {timeline.duration && (
                              <span className="text-sm text-gray-500">持续: {timeline.duration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {timeline.description && (
                      <p className="text-gray-600 text-sm mt-2">{timeline.description}</p>
                    )}
                  </div>

                  {/* 该时间线下的情节列表 */}
                  <div className="p-6">
                    {groupedPlots[timeline.id] && groupedPlots[timeline.id].length > 0 ? (
                      <div className="space-y-4">
                        {groupedPlots[timeline.id].map((plot, index) => (
                          <div key={plot.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer bg-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                  <h4 className="text-lg font-medium text-gray-900">{plot.title}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plot.type)}`}>
                                    {getTypeText(plot.type)}
                                  </span>
                                </div>
                                
                                {plot.summary && (
                                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{plot.summary}</p>
                                )}
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  {plot.wordCount > 0 && (
                                    <span>{plot.wordCount.toLocaleString()} 字</span>
                                  )}
                                  {plot.mood && (
                                    <span>基调: {plot.mood}</span>
                                  )}
                                  {plot.pov && (
                                    <span>视角: {plot.pov}</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>该时间线下还没有关联的情节</p>
                        <p className="text-xs mt-1">点击"添加时间线"按钮开始创建内容</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 未分配时间线的情节 - 独立于时间轴 */}
          {unassignedPlots.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-12">
              <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <h3 className="text-lg font-semibold text-gray-900">未分配时间线的情节</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">这些情节还没有关联到任何时间线，可以拖拽到相应的时间线中</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {unassignedPlots.map((plot) => (
                    <div key={plot.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{plot.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plot.type)}`}>
                              {getTypeText(plot.type)}
                            </span>
                          </div>
                          
                          {plot.summary && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{plot.summary}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};