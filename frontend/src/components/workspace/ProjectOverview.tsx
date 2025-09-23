import React, { useState, useEffect } from 'react';
import { Users, Globe, BookOpen, Clock, StickyNote, TrendingUp, Target, Calendar } from 'lucide-react';
import type { Project, ProjectStats } from '../../types';
import { projectsApi } from '../../services/api';

interface ProjectOverviewProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, onProjectUpdate }) => {
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
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Info Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            
            {project.description && (
              <p className="text-gray-600 mb-4">{project.description}</p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>创建于 {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>更新于 {formatDate(project.updatedAt)}</span>
              </div>
              {project.genre && (
                <div className="flex items-center space-x-1">
                  <span>类型：</span>
                  <span className="capitalize font-medium">{project.genre}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Circle */}
          {project.targetWords && (
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-black"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${Math.min(100, (project.wordCount / project.targetWords) * 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {Math.round((project.wordCount / project.targetWords) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {project.wordCount.toLocaleString()} / {project.targetWords.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">角色</p>
                <p className="text-2xl font-bold text-gray-900">{stats.characters}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">世界设定</p>
                <p className="text-2xl font-bold text-gray-900">{stats.worldSettings}</p>
              </div>
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">情节元素</p>
                <p className="text-2xl font-bold text-gray-900">{stats.plotElements.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">时间线</p>
                <p className="text-2xl font-bold text-gray-900">{stats.timelines}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Plot Elements Status */}
      {stats && stats.plotElements.total > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">情节进度</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.plotElements.byStatus).map(([status, count]) => {
              const getStatusInfo = (status: string) => {
                switch (status) {
                  case 'planned': return { label: '计划中', color: 'text-gray-600 bg-gray-100' };
                  case 'outlined': return { label: '已大纲', color: 'text-yellow-600 bg-yellow-100' };
                  case 'drafted': return { label: '草稿', color: 'text-blue-600 bg-blue-100' };
                  case 'completed': return { label: '已完成', color: 'text-green-600 bg-green-100' };
                  default: return { label: status, color: 'text-gray-600 bg-gray-100' };
                }
              };
              
              const statusInfo = getStatusInfo(status);
              
              return (
                <div key={status} className="text-center">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} mb-2`}>
                    {statusInfo.label}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all duration-200 text-left">
            <Users className="w-6 h-6 text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900">添加角色</h4>
            <p className="text-sm text-gray-600">创建新的角色卡片</p>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all duration-200 text-left">
            <BookOpen className="w-6 h-6 text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900">新建章节</h4>
            <p className="text-sm text-gray-600">开始写作新章节</p>
          </button>
          
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all duration-200 text-left">
            <StickyNote className="w-6 h-6 text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900">记录灵感</h4>
            <p className="text-sm text-gray-600">添加创作笔记</p>
          </button>
        </div>
      </div>
    </div>
  );
};