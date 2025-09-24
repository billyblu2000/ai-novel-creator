import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-[95vw] h-[95vh] rounded-lg shadow-xl flex overflow-hidden">
        {/* 左侧设置面板 */}
        {showSidebar && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* 头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">项目笔记</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {note ? '编辑笔记内容和设定' : '创建新的项目笔记'}
              </p>
            </div>

            {/* 表单区域 */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="笔记标题..."
                  required
                />
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分类 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {categoryOptions.find(opt => opt.value === formData.category)?.label}
                </p>
              </div>

              {/* 标签管理 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标签
                </label>
                
                {/* 现有标签 */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* 添加新标签 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="添加标签..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  按回车键或点击加号添加标签
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
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

        {/* 右侧创作区域 */}
        <div className="flex-1 flex flex-col relative">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                title={showSidebar ? '隐藏设置面板' : '显示设置面板'}
              >
                {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.title || '笔记内容'}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 笔记编辑区域 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-full resize-none border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white leading-relaxed text-lg"
                placeholder="开始记录你的想法..."
                style={{ 
                  fontFamily: 'serif',
                  lineHeight: '1.8',
                  padding: '60px 80px'
                }}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};