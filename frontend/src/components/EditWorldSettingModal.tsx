import React, { useState, useEffect } from 'react';
import { X, Globe, Tag, FileText, ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('basic');
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

  const sidebarSections = [
    { id: 'basic', label: '基本信息', icon: Globe },
    { id: 'category', label: '分类设定', icon: Tag },
    { id: 'content', label: '详细内容', icon: FileText },
    { id: 'importance', label: '重要性', icon: Star }
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
                {setting ? '编辑世界设定' : '添加世界设定'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {setting ? '修改世界设定信息' : '创建新的世界设定'}
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
                  {loading ? '保存中...' : (setting ? '更新' : '创建')}
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
                {setting ? setting.title : '新建世界设定'}
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
                          placeholder="设定标题..."
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
                          {formData.category === 'background' && '故事发生的基本背景和环境设定'}
                          {formData.category === 'culture' && '世界中的文化、习俗、传统等设定'}
                          {formData.category === 'geography' && '地理环境、地形、气候等自然环境设定'}
                          {formData.category === 'technology' && '科技水平、工具、武器等技术设定'}
                          {formData.category === 'magic' && '魔法体系、超自然力量等设定'}
                          {formData.category === 'society' && '社会结构、政治制度、法律等设定'}
                          {formData.category === 'history' && '历史事件、重要人物、时间线等设定'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'importance' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">重要性设定</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          重要性等级: {formData.importance}/10
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.importance}
                          onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) || 5 })}
                          className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <span>1 (次要)</span>
                          <span>5 (一般)</span>
                          <span>10 (核心)</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">重要性说明</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formData.importance <= 3 && '次要设定：对故事影响较小，可作为背景补充'}
                          {formData.importance > 3 && formData.importance <= 7 && '一般设定：对故事有一定影响，需要适当关注'}
                          {formData.importance > 7 && '核心设定：对故事发展至关重要，需要重点维护'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'content' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细内容</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        内容 *
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg leading-relaxed resize-vertical"
                        placeholder="详细描述这个世界设定的各个方面..."
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