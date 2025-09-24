import React, { useState, useEffect } from 'react';
import { X, User, Star, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('basic');
  const [showSidebar, setShowSidebar] = useState(true);

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

  const sidebarSections = [
    { id: 'basic', label: '基本信息', icon: User },
    { id: 'role', label: '角色设定', icon: Star },
    { id: 'description', label: '详细描述', icon: FileText }
  ];

  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-[95vw] h-[95vh] rounded-lg shadow-xl flex overflow-hidden">
        {/* 左侧边栏 */}
        {showSidebar && (
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* 侧边栏头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">编辑角色</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">修改角色信息和设定</p>
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
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : '保存更改'}
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
                {character.name}
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          角色名称 *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
                          placeholder="输入角色名称"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'role' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">角色设定</h3>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          角色类型
                        </label>
                        <select
                          id="role"
                          value={formData.role}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
                        >
                          <option value="protagonist">主角</option>
                          <option value="antagonist">反派</option>
                          <option value="supporting">配角</option>
                          <option value="minor">次要角色</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="importance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          重要性: {formData.importance}/10
                        </label>
                        <input
                          type="range"
                          id="importance"
                          min="1"
                          max="10"
                          value={formData.importance}
                          onChange={(e) => handleChange('importance', parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <span>1 (低)</span>
                          <span>5 (中)</span>
                          <span>10 (高)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'description' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细描述</h3>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        角色描述
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg leading-relaxed"
                        placeholder="描述角色的外貌、性格、背景、动机、成长轨迹等..."
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