import React, { useState, useEffect } from 'react';
import { X, FileText, Tag, Plus, ChevronLeft, ChevronRight, Bookmark, Edit3 } from 'lucide-react';
import type { ProjectNote, CreateProjectNoteData, UpdateProjectNoteData } from '../types';

interface EditProjectNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateProjectNoteData | UpdateProjectNoteData) => Promise<void>;
  note?: ProjectNote;
  projectId: string;
}

const categoryOptions = [
  { value: 'inspiration', label: '灵感记录' },
  { value: 'research', label: '资料研究' },
  { value: 'todo', label: '待办事项' },
  { value: 'idea', label: '创意想法' },
  { value: 'reference', label: '参考资料' }
];

export const EditProjectNoteModal: React.FC<EditProjectNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  note,
  projectId
}) => {
  const [formData, setFormData] = useState<{
    category: 'inspiration' | 'research' | 'todo' | 'idea' | 'reference';
    title: string;
    content: string;
    tags: string[];
  }>({
    category: 'inspiration',
    title: '',
    content: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (note) {
      setFormData({
        category: note.category,
        title: note.title,
        content: note.content,
        tags: [...note.tags]
      });
    } else {
      setFormData({
        category: 'inspiration',
        title: '',
        content: '',
        tags: []
      });
    }
    setNewTag('');
  }, [note, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (note) {
        // 更新现有笔记
        await onSave(formData);
      } else {
        // 创建新笔记
        await onSave({
          projectId,
          ...formData
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving project note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const sidebarSections = [
    { id: 'basic', label: '基本信息', icon: FileText },
    { id: 'category', label: '分类设定', icon: Bookmark },
    { id: 'tags', label: '标签管理', icon: Tag },
    { id: 'content', label: '笔记内容', icon: Edit3 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-[95vw] h-[95vh] rounded-lg shadow-xl flex overflow-hidden">
        {/* 左侧边栏 */}
        {showSidebar && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* 侧边栏头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {note ? '编辑项目笔记' : '添加项目笔记'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {note ? '修改笔记内容和设定' : '创建新的项目笔记'}
              </p>
            </div>

            {/* 导航菜单 */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 操作按钮 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : (note ? '更新' : '创建')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col relative">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
              >
                {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {note ? note.title : '新建项目笔记'}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {activeSection === 'basic' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          标题 *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
                          placeholder="笔记标题..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'category' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">分类设定</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          分类 *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
                          required
                        >
                          {categoryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">分类说明</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {categoryOptions.find(opt => opt.value === formData.category)?.label}：
                          {formData.category === 'inspiration' && '记录创作过程中的灵感和想法'}
                          {formData.category === 'research' && '收集和整理相关的研究资料'}
                          {formData.category === 'todo' && '记录需要完成的任务和事项'}
                          {formData.category === 'idea' && '记录各种创意和构思'}
                          {formData.category === 'reference' && '保存有用的参考资料和链接'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'tags' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">标签管理</h3>
                    <div className="space-y-6">
                      {/* 现有标签 */}
                      {formData.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            当前标签
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                              >
                                <Tag className="w-4 h-4 mr-2" />
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 添加新标签 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          添加新标签
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
                            placeholder="输入标签名称..."
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          按回车键或点击加号按钮添加标签
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">笔记内容</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        内容 *
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg leading-relaxed resize-vertical"
                        placeholder="记录你的想法、灵感或资料..."
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};