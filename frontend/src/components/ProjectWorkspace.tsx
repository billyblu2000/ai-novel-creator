import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Globe, Clock, StickyNote, Settings, PenTool, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Project } from '../types';
import { projectsApi } from '../services/api';
import { ProjectOverview } from './workspace/ProjectOverview';
import { CharactersManager } from './workspace/CharactersManager';
import { WorldSettingsManager } from './workspace/WorldSettingsManager';
import { PlotElementsManager } from './workspace/PlotElementsManager';
import { TimelineManager } from './workspace/TimelineManager';
import { NotesManager } from './workspace/NotesManager';
import { ProjectSettings } from './workspace/ProjectSettings';

const sidebarItems = [
  { id: 'overview', label: '项目概览', icon: BarChart3 },
  { id: 'characters', label: '角色管理', icon: Users },
  { id: 'world', label: '世界设定', icon: Globe },
  { id: 'timeline', label: '时间线', icon: Clock },
  { id: 'notes', label: '创作笔记', icon: StickyNote },
  { id: 'settings', label: '项目设置', icon: Settings },
];

export const ProjectWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('plot'); // 默认显示情节
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await projectsApi.getById(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button 
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={handleBackToDashboard}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                title="返回项目列表"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{project.title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{project.status}</p>
              </div>
              <button
                onClick={() => {
                  setActiveView('plot');
                  setSidebarOpen(false);
                }}
                className={`p-2 rounded-md transition-colors ${
                  activeView === 'plot' 
                    ? 'bg-black text-white dark:bg-white dark:text-black' 
                    : 'bg-gray-200 text-gray-600 hover:bg-black hover:text-white dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-white dark:hover:text-black'
                }`}
                title="故事大纲"
              >
                <PenTool className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors ml-2 text-gray-600 dark:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          {project.targetWords && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {project.wordCount.toLocaleString()} / {project.targetWords.toLocaleString()} 字
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-2 bg-black dark:bg-white rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (project.wordCount / project.targetWords) * 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round((project.wordCount / project.targetWords) * 100)}% 完成
              </div>
            </div>
          )}

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`nav-tab w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? '浅色模式' : '深色模式'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header - Only for mobile menu */}
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content - Full Screen Views */}
        <main className="flex-1 p-6 overflow-auto lg:pt-6 pt-0 bg-white dark:bg-gray-900">
          {activeView === 'plot' && <PlotElementsManager projectId={projectId!} project={project} />}
          {activeView === 'overview' && <ProjectOverview project={project} onProjectUpdate={setProject} />}
          {activeView === 'characters' && <CharactersManager projectId={projectId!} />}
          {activeView === 'world' && <WorldSettingsManager projectId={projectId!} />}
          {activeView === 'timeline' && <TimelineManager projectId={projectId!} />}
          {activeView === 'notes' && <NotesManager projectId={projectId!} />}
          {activeView === 'settings' && <ProjectSettings project={project} onProjectUpdate={setProject} />}
        </main>
      </div>
    </div>
  );
};