import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { WorldSetting, CreateWorldSettingData, UpdateWorldSettingData } from '../types';

interface EditWorldSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateWorldSettingData | UpdateWorldSettingData) => Promise<void>;
  setting?: WorldSetting;
  projectId: string;
}

const categoryOptions = [
  { value: 'background', label: '背景设定' },
  { value: 'culture', label: '文化设定' },
  { value: 'geography', label: '地理环境' },
  { value: 'technology', label: '科技设定' },
  { value: 'magic', label: '魔法体系' },
  { value: 'society', label: '社会制度' },
  { value: 'history', label: '历史背景' }
];

export const EditWorldSettingModal: React.FC<EditWorldSettingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  setting,
  projectId
}) => {
  const [formData, setFormData] = useState<{
    category: 'background' | 'culture' | 'geography' | 'technology' | 'magic' | 'society' | 'history';
    title: string;
    content: string;
    importance: number;
  }>({
    category: 'background',
    title: '',
    content: '',
    importance: 5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setting) {
      setFormData({
        category: setting.category,
        title: setting.title,
        content: setting.content,
        importance: setting.importance
      });
    } else {
      setFormData({
        category: 'background',
        title: '',
        content: '',
        importance: 5
      });
    }
  }, [setting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (setting) {
        // 更新现有设定
        await onSave(formData);
      } else {
        // 创建新设定
        await onSave({
          projectId,
          ...formData
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving world setting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {setting ? '编辑世界设定' : '添加世界设定'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 分类和重要性 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                重要性 (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.importance}
                onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

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
              placeholder="设定标题..."
              required
            />
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
              placeholder="详细描述这个世界设定..."
              required
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : (setting ? '更新' : '创建')}
          </button>
        </div>
      </div>
    </div>
  );
};