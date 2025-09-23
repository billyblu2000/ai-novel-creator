import React, { useState } from 'react';
import { Calendar, MoreHorizontal, Trash2, Edit3, BookOpen } from 'lucide-react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'archived':
        return 'Archived';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black hover:border-2 transition-all duration-200 ease-out group relative transform hover:scale-[1.02]">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
        
        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    onEdit(project);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Edit3 className="w-4 h-4 mr-3" />
                  Edit Project
                </button>
                <button
                  onClick={() => {
                    onDelete(project.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Project
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="cursor-pointer" onClick={() => {
        // TODO: Navigate to project detail page
        console.log('Navigate to project:', project.id);
      }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {project.title}
        </h3>
        
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" />
            <span>{project.wordCount.toLocaleString()} words</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};