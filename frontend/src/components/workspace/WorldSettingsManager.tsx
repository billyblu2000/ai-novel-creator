import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Globe } from 'lucide-react';
import type { WorldSetting, CreateWorldSettingData, UpdateWorldSettingData } from '../../types';
import { worldSettingsApi } from '../../services/api';
import { EditWorldSettingModal } from '../EditWorldSettingModal';

interface WorldSettingsManagerProps {
  projectId: string;
}

const categoryLabels = {
  background: '背景设定',
  culture: '文化设定',
  geography: '地理环境',
  technology: '科技设定',
  magic: '魔法体系',
  society: '社会制度',
  history: '历史背景'
};

export const WorldSettingsManager: React.FC<WorldSettingsManagerProps> = ({ projectId }) => {
  const [settings, setSettings] = useState<WorldSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<WorldSetting | undefined>();

  useEffect(() => {
    loadSettings();
  }, [projectId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await worldSettingsApi.getByProject(projectId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading world settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSetting = () => {
    setEditingSetting(undefined);
    setShowEditModal(true);
  };

  const handleEditSetting = (setting: WorldSetting) => {
    setEditingSetting(setting);
    setShowEditModal(true);
  };

  const handleSaveSetting = async (data: CreateWorldSettingData | UpdateWorldSettingData) => {
    try {
      if (editingSetting) {
        // 更新现有设定
        const updatedSetting = await worldSettingsApi.update(editingSetting.id, data as UpdateWorldSettingData);
        setSettings(prev => prev.map(s => s.id === editingSetting.id ? updatedSetting : s));
      } else {
        // 创建新设定
        const newSetting = await worldSettingsApi.create(data as CreateWorldSettingData);
        setSettings(prev => [...prev, newSetting]);
      }
    } catch (error) {
      console.error('Error saving world setting:', error);
      throw error;
    }
  };

  const handleDeleteSetting = async (setting: WorldSetting) => {
    if (!confirm(`确定要删除设定"${setting.title}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await worldSettingsApi.delete(setting.id);
      setSettings(prev => prev.filter(s => s.id !== setting.id));
    } catch (error) {
      console.error('Error deleting world setting:', error);
    }
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedSettings = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, WorldSetting[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">世界设定</h2>
          <p className="text-gray-600">构建你的小说世界观</p>
        </div>
        <button
          onClick={handleCreateSetting}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加设定</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索设定..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white w-full"
          >
            <option value="all">所有分类</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      {Object.keys(groupedSettings).length === 0 ? (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {settings.length === 0 ? '还没有世界设定' : '没有找到匹配的设定'}
          </h3>
          <p className="text-gray-600 mb-4">
            {settings.length === 0 ? '开始构建你的小说世界吧' : '尝试调整搜索条件'}
          </p>
          {settings.length === 0 && (
            <button
              onClick={handleCreateSetting}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              创建设定
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {categoryLabels[category as keyof typeof categoryLabels] || category}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({categorySettings.length})
                </span>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className={`border-2 border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer ${
                    setting.importance >= 8 ? 'bg-gray-100' 
                    : setting.importance >= 6 ? 'bg-slate-50'
                    : setting.importance >= 4 ? 'bg-gray-50'
                    : 'bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">{setting.title}</h4>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleEditSetting(setting)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="编辑设定"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSetting(setting)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除设定"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-6 mb-4">
                      {setting.content}
                    </p>
                    

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑模态框 */}
      <EditWorldSettingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveSetting}
        setting={editingSetting}
        projectId={projectId}
      />
    </div>
  );
};