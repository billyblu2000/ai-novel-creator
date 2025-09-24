import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showSidebar, setShowSidebar] = useState(true);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-[95vw] h-[95vh] rounded-lg shadow-xl flex overflow-hidden">
        {/* 左侧设置面板 */}
        {showSidebar && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* 头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">世界设定</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {setting ? '编辑世界设定信息' : '创建新的世界设定'}
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
                  placeholder="设定标题..."
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

              {/* 重要性 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  重要性: {formData.importance}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) || 5 })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1 (次要)</span>
                  <span>5 (一般)</span>
                  <span>10 (核心)</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.importance <= 3 && '次要设定：对故事影响较小'}
                  {formData.importance > 3 && formData.importance <= 7 && '一般设定：对故事有一定影响'}
                  {formData.importance > 7 && '核心设定：对故事发展至关重要'}
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
                  {loading ? '保存中...' : (setting ? '更新' : '创建')}
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
                {formData.title || '世界设定内容'}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 内容编辑区域 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-full resize-none border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white leading-relaxed text-lg"
                placeholder="开始描述这个世界设定..."
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