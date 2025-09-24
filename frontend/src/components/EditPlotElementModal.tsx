import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { Project, PlotElement } from '../types';
import { plotElementsApi } from '../services/api';

interface EditPlotElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
  element: PlotElement | null;
}

export const EditPlotElementModal: React.FC<EditPlotElementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  project,
  element
}) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    notes: '',
    status: 'planned' as 'completed' | 'planned' | 'outlined' | 'drafted',
    targetWords: '',
    mood: '',
    pov: ''
  });
  const [loading, setLoading] = useState(false);

  // 当element变化时更新表单数据
  useEffect(() => {
    if (element) {
      setFormData({
        title: element.title || '',
        summary: element.summary || '',
        notes: element.notes || '',
        status: element.status || 'planned',
        targetWords: element.targetWords?.toString() || '',
        mood: element.mood || '',
        pov: element.pov || ''
      });
    }
  }, [element]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'book': return project.levelNames.book;
      case 'part': return project.levelNames.part;
      case 'chapter': return project.levelNames.chapter;
      case 'scene': return project.levelNames.scene;
      case 'beat': return '节拍';
      default: return type;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!element || !formData.title.trim()) return;

    setLoading(true);
    try {
      await plotElementsApi.update(element.id, {
        title: formData.title.trim(),
        summary: formData.summary || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        targetWords: formData.targetWords ? parseInt(formData.targetWords) : undefined,
        mood: formData.mood || undefined,
        pov: formData.pov || undefined
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating plot element:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !element) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            编辑{getTypeLabel(element.type)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              placeholder={`输入${getTypeLabel(element.type)}标题`}
              required
            />
          </div>

          {/* 概要 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              概要
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="简要描述这个情节的内容..."
            />
          </div>

          {/* 笔记 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              创作笔记
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="记录创作想法、灵感或注意事项..."
            />
          </div>

          {/* 状态和目标字数 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                状态
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                >
                  <option value="planned">计划中</option>
                  <option value="outlined">已大纲</option>
                  <option value="drafted">草稿</option>
                  <option value="completed">已完成</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标字数
              </label>
              <input
                type="number"
                value={formData.targetWords}
                onChange={(e) => setFormData({ ...formData, targetWords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* 基调和视角 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                基调/氛围
              </label>
              <input
                type="text"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="如：紧张、温馨、悲伤..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                视角
              </label>
              <input
                type="text"
                value={formData.pov}
                onChange={(e) => setFormData({ ...formData, pov: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="如：第一人称、第三人称..."
              />
            </div>
          </div>

          {/* 元素信息 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">元素信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">类型：</span>
                <span className="text-gray-900 dark:text-white">{getTypeLabel(element.type)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">当前字数：</span>
                <span className="text-gray-900 dark:text-white">{element.wordCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">排序：</span>
                <span className="text-gray-900 dark:text-white">{element.order}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">创建时间：</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(element.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black"></div>
              ) : null}
              <span>{loading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};