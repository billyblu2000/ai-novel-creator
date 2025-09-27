import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Globe, BookOpen, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project, ProjectStats } from '../types';
import { projectsApi } from '../services/api';
import { UserMenu } from './UserMenu';
import { useTheme } from '../contexts/ThemeContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  useTheme(); // 确保主题上下文可用
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');



  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
      
      // Load stats for each project
      const stats: Record<string, ProjectStats> = {};
      await Promise.all(
        data.map(async (project) => {
          try {
            const projectStats = await projectsApi.getStats(project.id);
            stats[project.id] = projectStats;
          } catch (error) {
            console.error(`Error loading stats for project ${project.id}:`, error);
          }
        })
      );
      setProjectStats(stats);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };





  // const handleDeleteProject = async (id: string) => {
  //   if (!confirm('确定要删除这个项目吗？')) return;
  //   
  //   try {
  //     await projectsApi.delete(id);
  //     setProjects(prev => prev.filter(p => p.id !== id));
  //   } catch (error) {
  //     console.error('Error deleting project:', error);
  //   }
  // };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white">AI Novel Creator</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">管理你的小说项目</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新建项目</span>
            </button>
            <UserMenu />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full"
            >
              <option value="all">所有状态</option>
              <option value="draft">草稿</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {projects.length === 0 ? '还没有项目' : '没有找到匹配的项目'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {projects.length === 0 ? '创建你的第一个小说项目开始创作吧' : '尝试调整搜索条件或筛选器'}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => navigate('/create')}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-md transition-colors"
              >
                创建项目
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const stats = projectStats[project.id];
              
              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                        {project.genre && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {project.genre}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Project Stats */}
                  {stats && (
                    <div className="grid grid-cols-4 gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{stats.characters}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{stats.worldSettings}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{stats.plotElements.total}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{stats.timelines}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>{project.wordCount.toLocaleString()} 字</span>
                    <span>{new Date(project.updatedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  
                  {project.targetWords && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>进度</span>
                        <span>{Math.round((project.wordCount / project.targetWords) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-black dark:bg-white h-1 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (project.wordCount / project.targetWords) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
};