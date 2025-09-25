import React, { useState } from 'react';
import { X, Clock, Calendar, Timer, Sparkles } from 'lucide-react';
import type { CreateTimelineData, UpdateTimelineData, Timeline } from '../types';

interface CreateTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTimelineData | UpdateTimelineData, isEdit?: boolean) => Promise<void>;
  timeline?: Timeline | null;
  projectId: string;
}

export const CreateTimelineModal: React.FC<CreateTimelineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  timeline,
  projectId
}) => {
  const [formData, setFormData] = useState({
    name: timeline?.name || '',
    description: timeline?.description || '',
    storyDate: timeline?.storyDate || '',
    timeType: timeline?.timeType || 'absolute' as 'absolute' | 'relative' | 'symbolic',
    chronOrder: timeline?.chronOrder || 0,
    importance: timeline?.importance || 5,
    duration: timeline?.duration || ''
  });

  // 当timeline prop变化时更新表单数据
  React.useEffect(() => {
    if (timeline) {
      setFormData({
        name: timeline.name || '',
        description: timeline.description || '',
        storyDate: timeline.storyDate || '',
        timeType: timeline.timeType || 'absolute',
        chronOrder: timeline.chronOrder || 0,
        importance: timeline.importance || 5,
        duration: timeline.duration || ''
      });
    } else {
      // 重置表单为默认值
      setFormData({
        name: '',
        description: '',
        storyDate: '',
        timeType: 'absolute',
        chronOrder: 0,
        importance: 5,
        duration: ''
      });
    }
  }, [timeline]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const submitData = timeline 
        ? formData as UpdateTimelineData
        : { ...formData, projectId } as CreateTimelineData;
      
      await onSubmit(submitData, !!timeline);
      onClose();
      
      // 重置表单
      if (!timeline) {
        setFormData({
          name: '',
          description: '',
          storyDate: '',
          timeType: 'absolute',
          chronOrder: 0,
          importance: 5,
          duration: ''
        });
      }
    } catch (error) {
      console.error('Error saving timeline:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {timeline ? '编辑时间线' : '创建时间线'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {timeline ? '修改时间线信息' : '为项目添加新的时间线'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>基本信息</span>
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                时间线名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如：主线剧情、回忆线、平行时空..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="描述这条时间线的作用和特点..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>
          </div>

          {/* 时间属性 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>时间属性</span>
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                时间类型
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.timeType === 'absolute' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="timeType"
                    value="absolute"
                    checked={formData.timeType === 'absolute'}
                    onChange={(e) => handleInputChange('timeType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">绝对时间</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">具体日期时间</div>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.timeType === 'relative' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="timeType"
                    value="relative"
                    checked={formData.timeType === 'relative'}
                    onChange={(e) => handleInputChange('timeType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">相对时间</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">相对时间点</div>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.timeType === 'symbolic' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}>
                  <input
                    type="radio"
                    name="timeType"
                    value="symbolic"
                    checked={formData.timeType === 'symbolic'}
                    onChange={(e) => handleInputChange('timeType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">象征时间</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">抽象时间概念</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  故事时间
                </label>
                <input
                  type="text"
                  value={formData.storyDate}
                  onChange={(e) => handleInputChange('storyDate', e.target.value)}
                  placeholder="例如：2024年春天、第三天、黎明前..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  持续时间
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="例如：3小时、一整天、数年..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* 重要性设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">重要性设置</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                重要性 ({formData.importance}/10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.importance}
                onChange={(e) => handleInputChange('importance', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>次要</span>
                <span>重要</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                新创建的时间线将自动排在最前面，你可以通过拖拽来调整顺序
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '保存中...' : (timeline ? '更新时间线' : '创建时间线')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};