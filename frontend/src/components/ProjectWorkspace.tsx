import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Globe, BookOpen, Clock, StickyNote, Settings } from 'lucide-react';
import type { Project } from '../types';
import { projectsApi } from '../services/api';
import { ProjectOverview } from './workspace/ProjectOverview';
import { CharactersManager } from './workspace/CharactersManager';
import { WorldSettingsManager } from './workspace/WorldSettingsManager';
import { PlotElementsManager } from './workspace/PlotElementsManager';
import { TimelineManager } from './workspace/TimelineManager';
import { NotesManager } from './workspace/NotesManager';
import { ProjectSettings } from './workspace/ProjectSettings';

const navigationItems = [
  { id: 'overview', label: '概览', icon: BarChart3, path: '' },
  { id: 'characters', label: '角色', icon: Users, path: 'characters' },
  { id: 'world', label: '世界', icon: Globe, path: 'world' },
  { id: 'plot', label: '情节', icon: BookOpen, path: 'plot' },
  { id: 'timeline', label: '时间线', icon: Clock, path: 'timeline' },
  { id: 'notes', label: '笔记', icon: StickyNote, path: 'notes' },
  { id: 'settings', label: '设置', icon: Settings, path: 'settings' },
];

export const ProjectWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-black">{project.title}</h1>
                <p className="text-sm text-gray-600">
                  {project.genre && <span className="capitalize">{project.genre}</span>}
                  {project.genre && project.status && <span className="mx-2">•</span>}
                  <span className="capitalize">{project.status}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {project.targetWords && (
                <div className="text-sm text-gray-600">
                  {project.wordCount.toLocaleString()} / {project.targetWords.toLocaleString()} 字
                  <div className="w-24 h-1 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-1 bg-black rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (project.wordCount / project.targetWords) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const currentPath = window.location.pathname;
              const expectedPath = `/project/${projectId}/${item.path}`;
              const isActive = currentPath === expectedPath || 
                             (item.path === '' && currentPath === `/project/${projectId}`);
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/project/${projectId}/${item.path}`)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="" element={<ProjectOverview project={project} onProjectUpdate={setProject} />} />
          <Route path="characters" element={<CharactersManager projectId={projectId!} />} />
          <Route path="world" element={<WorldSettingsManager projectId={projectId!} />} />
          <Route path="plot" element={<PlotElementsManager projectId={projectId!} />} />
          <Route path="timeline" element={<TimelineManager projectId={projectId!} />} />
          <Route path="notes" element={<NotesManager projectId={projectId!} />} />
          <Route path="settings" element={<ProjectSettings project={project} onProjectUpdate={setProject} />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
    </div>
  );
};