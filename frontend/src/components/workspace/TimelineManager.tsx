import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock } from 'lucide-react';
import type { Timeline } from '../../types';
import { timelinesApi } from '../../services/api';

interface TimelineManagerProps {
  projectId: string;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({ projectId }) => {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTimelines();
  }, [projectId]);

  const loadTimelines = async () => {
    try {
      setLoading(true);
      const data = await timelinesApi.getByProject(projectId);
      setTimelines(data.sort((a, b) => a.chronOrder - b.chronOrder));
    } catch (error) {
      console.error('Error loading timelines:', error);
    } finally {
      setLoading(false);
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
          <span>添加时间点</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索时间点..."
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

      {/* Timeline Content */}
      {filteredTimelines.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {timelines.length === 0 ? '还没有时间线' : '没有找到匹配的时间点'}
          </h3>
          <p className="text-gray-600 mb-4">
            {timelines.length === 0 ? '开始创建你的故事时间轴吧' : '尝试调整搜索条件'}
          </p>
          {timelines.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              创建时间点
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Timeline Visualization */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">时间轴视图</h3>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {/* Timeline Items */}
              <div className="space-y-6">
                {filteredTimelines.map((timeline, index) => (
                  <div key={timeline.id} className="relative flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-black rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Timeline Content */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{timeline.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(timeline.timeType)}`}>
                              {getTypeText(timeline.timeType)}
                            </span>
                          </div>
                          
                          {timeline.description && (
                            <p className="text-gray-600 text-sm mb-2">{timeline.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {timeline.storyDate && (
                              <span>时间: {timeline.storyDate}</span>
                            )}
                            {timeline.duration && (
                              <span>持续: {timeline.duration}</span>
                            )}
                            <span>重要程度: {timeline.importance}/10</span>
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTimelines.map((timeline) => (
              <div key={timeline.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{timeline.name}</h4>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(timeline.timeType)}`}>
                      {getTypeText(timeline.timeType)}
                    </span>
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
                
                {timeline.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{timeline.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  {timeline.storyDate && (
                    <div>时间: {timeline.storyDate}</div>
                  )}
                  {timeline.duration && (
                    <div>持续: {timeline.duration}</div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>重要程度: {timeline.importance}/10</span>
                    <div className="w-16 h-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-1 bg-black rounded-full transition-all duration-300"
                        style={{ width: `${timeline.importance * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};