import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateCharacterData } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCharacterData) => void;
  projectId: string;
}

export const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId
}) => {
  useTheme(); // 确保主题上下文可用
  const [formData, setFormData] = useState({
    name: '',
    role: 'supporting' as 'protagonist' | 'antagonist' | 'supporting' | 'minor',
    description: '',
    importance: 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        projectId,
        name: formData.name.trim(),
        role: formData.role,
        description: formData.description.trim(),
        importance: formData.importance
      });
      
      // Reset form
      setFormData({
        name: '',
        role: 'supporting' as 'protagonist' | 'antagonist' | 'supporting' | 'minor',
        description: '',
        importance: 5
      });
      onClose();
    } catch (error) {
      console.error('Error creating character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role: role as 'protagonist' | 'antagonist' | 'supporting' | 'minor'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">创建新角色</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 角色名称 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              角色名称 *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="输入角色名称"
              required
            />
          </div>

          {/* 角色类型 */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              角色类型
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="protagonist">主角</option>
              <option value="antagonist">反派</option>
              <option value="supporting">配角</option>
              <option value="minor">次要角色</option>
            </select>
          </div>

          {/* 重要性 */}
          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              重要性: {formData.importance}/10
            </label>
            <input
              type="range"
              id="importance"
              min="1"
              max="10"
              value={formData.importance}
              onChange={(e) => handleChange('importance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 (低)</span>
              <span>5 (中)</span>
              <span>10 (高)</span>
            </div>
          </div>

          {/* 角色描述 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              角色描述
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors resize-y min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="描述角色的外貌、性格、背景等..."
            />
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建角色'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};