import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Character, UpdateCharacterData } from '../types';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateCharacterData) => void;
  character: Character | null;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  character
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'supporting' as 'protagonist' | 'antagonist' | 'supporting' | 'minor',
    description: '',
    importance: 5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        role: character.role as 'protagonist' | 'antagonist' | 'supporting' | 'minor',
        description: character.description,
        importance: character.importance
      });
    }
  }, [character]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!character || !formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(character.id, {
        name: formData.name.trim(),
        role: formData.role,
        description: formData.description.trim(),
        importance: formData.importance
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating character:', error);
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

  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">编辑角色</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 角色名称 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              角色名称 *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
              placeholder="输入角色名称"
              required
            />
          </div>

          {/* 角色类型 */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              角色类型
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white"
            >
              <option value="protagonist">主角</option>
              <option value="antagonist">反派</option>
              <option value="supporting">配角</option>
              <option value="minor">次要角色</option>
            </select>
          </div>

          {/* 重要性 */}
          <div>
            <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
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
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (低)</span>
              <span>5 (中)</span>
              <span>10 (高)</span>
            </div>
          </div>

          {/* 角色描述 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              角色描述
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors resize-y min-h-[100px]"
              placeholder="描述角色的外貌、性格、背景等..."
            />
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};