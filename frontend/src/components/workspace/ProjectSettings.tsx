import React, { useState } from 'react';
import { Save, Trash2, Settings, Eye, AlertTriangle } from 'lucide-react';
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
    targetWords: project.targetWords || '',
    plotViewMode: project.plotViewMode,
    levelNames: { ...project.levelNames }
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 检查是否有多个卷，如果有则不允许切换到简化视图
  const hasMultipleParts = () => {
    if (!project.plotElements) return false;
    const parts = project.plotElements.filter(el => el.type === 'part');
    return parts.length >= 2;
  };
  
  const canSwitchToSimplified = !hasMultipleParts();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLevelNameChange = (level: keyof typeof formData.levelNames, value: string) => {
    setFormData(prev => ({
      ...prev,
      levelNames: {
        ...prev.levelNames,
        [level]: value
      }
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
        targetWords: formData.targetWords ? Number(formData.targetWords) : undefined,
        plotViewMode: formData.plotViewMode,
        levelNames: formData.levelNames
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">项目设置</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">管理项目的基本信息和配置选项</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">基本信息</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              项目标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="输入项目标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="描述你的小说项目..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                小说类型
              </label>
              <div className="relative">
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                项目状态
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">草稿</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="archived">已归档</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标字数
              </label>
              <input
                type="number"
                value={formData.targetWords}
                onChange={(e) => handleInputChange('targetWords', e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="100000"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plot Management Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">情节管理设置</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              情节视图模式
            </label>
            <div className="space-y-4">
              <label className={`flex items-start space-x-4 p-4 border-2 rounded-lg transition-all ${
                formData.plotViewMode === 'simplified' 
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${canSwitchToSimplified ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <input
                  type="radio"
                  name="plotViewMode"
                  value="simplified"
                  checked={formData.plotViewMode === 'simplified'}
                  onChange={(e) => canSwitchToSimplified && handleInputChange('plotViewMode', e.target.value)}
                  disabled={!canSwitchToSimplified}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">简化视图</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    只显示章节层级，适合大多数创作者的简洁体验
                  </div>
                  {!canSwitchToSimplified && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>项目包含多个卷，无法切换到简化视图</span>
                    </div>
                  )}
                </div>
              </label>
              
              <label className={`flex items-start space-x-4 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                formData.plotViewMode === 'complete' 
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  name="plotViewMode"
                  value="complete"
                  checked={formData.plotViewMode === 'complete'}
                  onChange={(e) => handleInputChange('plotViewMode', e.target.value)}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">完整视图</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    显示书-部-章-场景的完整四级结构，适合复杂项目
                  </div>
                </div>
              </label>
            </div>
            
            {project.plotElements && project.plotElements.length > 0 && formData.plotViewMode !== project.plotViewMode && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    更改视图模式不会影响已有的情节结构，只会改变显示方式。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              层级命名自定义
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bookName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  第一级别名称
                </label>
                <input
                  type="text"
                  id="bookName"
                  value={formData.levelNames.book}
                  onChange={(e) => handleLevelNameChange('book', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="partName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  第二级别名称
                </label>
                <input
                  type="text"
                  id="partName"
                  value={formData.levelNames.part}
                  onChange={(e) => handleLevelNameChange('part', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="chapterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  第三级别名称
                </label>
                <input
                  type="text"
                  id="chapterName"
                  value={formData.levelNames.chapter}
                  onChange={(e) => handleLevelNameChange('chapter', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="sceneName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  第四级别名称
                </label>
                <input
                  type="text"
                  id="sceneName"
                  value={formData.levelNames.scene}
                  onChange={(e) => handleLevelNameChange('scene', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving || !formData.title.trim()}
          className="flex items-center space-x-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-base font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? '保存中...' : '保存所有更改'}</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">危险操作</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <h3 className="text-base font-semibold text-red-900 dark:text-red-100 mb-1">删除项目</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                永久删除此项目及其所有数据，包括角色、设定、情节等。此操作不可撤销。
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
              <span>删除项目</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">确认删除项目</h3>
              </div>
              
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                你确定要删除项目 "<strong className="text-gray-900 dark:text-gray-100">{project.title}</strong>" 吗？
                此操作将永久删除所有相关数据，且无法恢复。
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 text-base font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 text-base font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};