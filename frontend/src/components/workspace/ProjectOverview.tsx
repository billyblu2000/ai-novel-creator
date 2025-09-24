import React, { useState, useEffect } from 'react';
import { Users, Globe, BookOpen, Clock, StickyNote, Calendar, BarChart3, Target, TrendingUp } from 'lucide-react';
import type { Project, ProjectStats } from '../../types';
import { projectsApi } from '../../services/api';

interface ProjectOverviewProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [project.id]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getStats(project.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading project stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'archived': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      default: return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'archived': return '已归档';
      default: return '草稿';
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
    <div className="space-y-8">
      {/* Project Info Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            
            {project.description && (
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{project.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>创建于 {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>更新于 {formatDate(project.updatedAt)}</span>
              </div>
              {project.genre && (
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>类型：<span className="capitalize font-medium text-gray-700 dark:text-gray-300">{project.genre}</span></span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Circle */}
          {project.targetWords && (
            <div className="flex flex-col items-center ml-8">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-black dark:text-white"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${Math.min(100, (project.wordCount / project.targetWords) * 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {Math.round((project.wordCount / project.targetWords) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                {project.wordCount.toLocaleString()} / {project.targetWords.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Statistics */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">项目统计</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {project.wordCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">当前字数</div>
            </div>
            
            {project.targetWords && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {Math.round((project.wordCount / project.targetWords) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">完成进度</div>
              </div>
            )}
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {new Date(project.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">创建日期</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {new Date(project.updatedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">最后更新</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">角色</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.characters}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">世界设定</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.worldSettings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">情节元素</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.plotElements.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">时间线</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.timelines}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plot Elements Status */}
      {stats && stats.plotElements.total > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">情节进度</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(stats.plotElements.byStatus).map(([status, count]) => {
                const getStatusInfo = (status: string) => {
                  switch (status) {
                    case 'planned': return { label: '计划中', color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700' };
                    case 'outlined': return { label: '已大纲', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' };
                    case 'drafted': return { label: '草稿', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' };
                    case 'completed': return { label: '已完成', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' };
                    default: return { label: status, color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700' };
                  }
                };
                
                const statusInfo = getStatusInfo(status);
                
                return (
                  <div key={status} className="text-center">
                    <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color} mb-3`}>
                      {statusInfo.label}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">快速操作</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">添加角色</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">创建新的角色卡片，丰富故事人物</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left group">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">新建章节</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">开始写作新章节，推进故事情节</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <StickyNote className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">记录灵感</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">添加创作笔记，保存创意想法</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};