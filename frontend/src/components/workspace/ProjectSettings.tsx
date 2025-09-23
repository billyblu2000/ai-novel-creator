import React, { useState } from 'react';
import { Save, Trash2, Archive, Settings as SettingsIcon } from 'lucide-react';
import type { Project } from '../../types';
import { projectsApi } from '../../services/api';

interface ProjectSettingsProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onProjectUpdate }) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    genre: project.genre || '',
    status: project.status,
    targetWords: project.targetWords || ''
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProject = await projectsApi.update(project.id, {
        title: formData.title,
        description: formData.description || undefined,
        genre: formData.genre || undefined,
        status: formData.status,
        targetWords: formData.targetWords ? Number(formData.targetWords) : undefined
      });
      onProjectUpdate(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectsApi.delete(project.id);
      // Navigate back to dashboard
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">项目设置</h2>
        <p className="text-gray-600">管理项目的基本信息和配置</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
              placeholder="输入项目标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
              placeholder="描述你的小说项目"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                小说类型
              </label>
              <div className="relative">
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white"
                >
                  <option value="">选择类型</option>
                  <option value="fantasy">奇幻</option>
                  <option value="romance">言情</option>
                  <option value="mystery">悬疑</option>
                  <option value="scifi">科幻</option>
                  <option value="historical">历史</option>
                  <option value="contemporary">现代</option>
                  <option value="thriller">惊悚</option>
                  <option value="literary">文学</option>
                  <option value="other">其他</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                项目状态
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white"
                >
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标字数
            </label>
            <input
              type="number"
              value={formData.targetWords}
              onChange={(e) => handleInputChange('targetWords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
              placeholder="例如: 100000"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '保存中...' : '保存更改'}</span>
          </button>
        </div>
      </div>

      {/* Project Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">项目统计</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{project.wordCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">当前字数</div>
          </div>
          
          {project.targetWords && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((project.wordCount / project.targetWords) * 100)}%
              </div>
              <div className="text-sm text-gray-600">完成进度</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Date(project.createdAt).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-sm text-gray-600">创建日期</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-sm text-gray-600">最后更新</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4">危险操作</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900">删除项目</h4>
              <p className="text-sm text-red-700">永久删除此项目及其所有数据，此操作不可撤销</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除项目</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">确认删除项目</h3>
            <p className="text-gray-600 mb-6">
              你确定要删除项目 "<strong>{project.title}</strong>" 吗？
              此操作将永久删除所有相关数据，包括角色、设定、情节等，且无法恢复。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};