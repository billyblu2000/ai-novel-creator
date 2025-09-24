import React, { useState } from 'react';
import { ArrowLeft, Info, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CreateProjectData } from '../types';
import { projectsApi } from '../services/api';

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    targetWords: '',
    plotViewMode: 'simplified' as 'simplified' | 'complete',
    levelNames: {
      book: '书',
      part: '卷',
      chapter: '章',
      scene: '场景'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const submitData: CreateProjectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        genre: formData.genre.trim() || undefined,
        targetWords: formData.targetWords ? parseInt(formData.targetWords) : undefined,
        plotViewMode: formData.plotViewMode,
        levelNames: formData.levelNames
      };

      const newProject = await projectsApi.create(submitData);
      
      // 创建成功后跳转到项目页面
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLevelNameChange = (level: keyof typeof formData.levelNames, value: string) => {
    setFormData(prev => ({
      ...prev,
      levelNames: {
        ...prev.levelNames,
        [level]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">创建新项目</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">设置你的小说项目并开始创作</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 主要表单区域 */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本信息 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  基本信息
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      项目标题 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="输入你的小说标题..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      项目描述
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="简要描述你的故事背景、主题或创作灵感..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors resize-y bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        小说类型
                      </label>
                      <input
                        type="text"
                        id="genre"
                        value={formData.genre}
                        onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                        placeholder="如：奇幻、言情、悬疑、科幻..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="targetWords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        目标字数
                      </label>
                      <input
                        type="number"
                        id="targetWords"
                        value={formData.targetWords}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetWords: e.target.value }))}
                        placeholder="如：100000"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 情节管理设置 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">情节管理设置</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      选择情节视图模式
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="radio"
                          name="plotViewMode"
                          value="simplified"
                          checked={formData.plotViewMode === 'simplified'}
                          onChange={(e) => setFormData(prev => ({ ...prev, plotViewMode: e.target.value as 'simplified' | 'complete' }))}
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                        <div className="flex-1">
                          <div className="text-base font-medium text-gray-900 dark:text-white">简化视图（推荐）</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            只显示章节层级，适合大多数创作者。系统会自动创建默认的书和部结构，你可以专注于章节内容的创作。
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            ✓ 降低学习成本 ✓ 快速开始写作 ✓ 适合新手
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="radio"
                          name="plotViewMode"
                          value="complete"
                          checked={formData.plotViewMode === 'complete'}
                          onChange={(e) => setFormData(prev => ({ ...prev, plotViewMode: e.target.value as 'simplified' | 'complete' }))}
                          className="mt-1"
                          disabled={isSubmitting}
                        />
                        <div className="flex-1">
                          <div className="text-base font-medium text-gray-900 dark:text-white">完整视图</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            显示书-部-章-场景的完整四级结构，适合复杂的长篇创作。提供更精细的情节组织和管理能力。
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            ✓ 精细化管理 ✓ 复杂结构支持 ✓ 适合长篇创作
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 高级设置 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200 transition-colors mb-4"
                  disabled={isSubmitting}
                >
                  <Info className="w-5 h-5" />
                  <span>高级设置</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {showAdvanced ? '（点击收起）' : '（点击展开）'}
                  </span>
                </button>

                {showAdvanced && (
                  <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">层级命名自定义</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        你可以自定义各个层级的名称，比如将"部"改为"卷"，将"章"改为"回"等。这些名称将在整个项目中使用。
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="bookName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            书级别名称
                          </label>
                          <input
                            type="text"
                            id="bookName"
                            value={formData.levelNames.book}
                            onChange={(e) => handleLevelNameChange('book', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="partName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            部级别名称
                          </label>
                          <input
                            type="text"
                            id="partName"
                            value={formData.levelNames.part}
                            onChange={(e) => handleLevelNameChange('part', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="chapterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            章级别名称
                          </label>
                          <input
                            type="text"
                            id="chapterName"
                            value={formData.levelNames.chapter}
                            onChange={(e) => handleLevelNameChange('chapter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label htmlFor="sceneName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            场景级别名称
                          </label>
                          <input
                            type="text"
                            id="sceneName"
                            value={formData.levelNames.scene}
                            onChange={(e) => handleLevelNameChange('scene', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-black dark:hover:border-white focus:outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim() || isSubmitting}
                  className="px-8 py-3 text-white bg-black border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '创建中...' : '创建项目'}
                </button>
              </div>
            </form>
          </div>

          {/* 侧边栏信息 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
                  💡 创建提示
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>• 项目创建后会自动生成默认的结构</li>
                  <li>• 你可以随时在设置中修改配置</li>
                  <li>• 简化视图适合大多数创作场景</li>
                  <li>• 所有设置都可以后续调整</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-3">
                  🚀 即将创建
                </h3>
                <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <div>默认{formData.levelNames.book}：默认{formData.levelNames.book}</div>
                  <div className="ml-4">└ 第一{formData.levelNames.part}：第一{formData.levelNames.part}</div>
                  <div className="ml-8">└ 第一{formData.levelNames.chapter}：第一{formData.levelNames.chapter}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};