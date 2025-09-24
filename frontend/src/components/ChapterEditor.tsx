import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Clock,
  BookOpen,
  Users,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Type
} from 'lucide-react';
import type { PlotElement, Character, WorldSetting } from '../types';
import { plotElementsApi, charactersApi, worldSettingsApi } from '../services/api';

export const ChapterEditor: React.FC = () => {
  const { projectId, elementId } = useParams<{ projectId: string; elementId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [element, setElement] = useState<PlotElement | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldSettings, setWorldSettings] = useState<WorldSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');

  // 编辑器状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'planned' | 'outlined' | 'drafted' | 'completed'>('planned');
  const [targetWords, setTargetWords] = useState<number | undefined>();
  const [mood, setMood] = useState('');
  const [pov, setPov] = useState('');

  useEffect(() => {
    if (projectId && elementId) {
      loadData();
    }
  }, [projectId, elementId]);

  useEffect(() => {
    // 计算字数
    const text = content.replace(/\s+/g, '').trim();
    setWordCount(text.length);
  }, [content]);

  useEffect(() => {
    // 自动保存
    if (element && !saving) {
      const timer = setTimeout(() => {
        handleSave(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [content, title, summary, notes, status, targetWords, mood, pov]);

  const loadData = async () => {
    if (!projectId || !elementId) return;
    
    try {
      setLoading(true);
      const [elementData, charactersData, worldSettingsData] = await Promise.all([
        plotElementsApi.getById(elementId),
        charactersApi.getByProject(projectId),
        worldSettingsApi.getByProject(projectId)
      ]);
      
      setElement(elementData);
      setCharacters(charactersData);
      setWorldSettings(worldSettingsData);
      
      // 设置表单数据
      setTitle(elementData.title);
      setContent(elementData.content || '');
      setSummary(elementData.summary || '');
      setNotes(elementData.notes || '');
      setStatus(elementData.status);
      setTargetWords(elementData.targetWords);
      setMood(elementData.mood || '');
      setPov(elementData.pov || '');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!element || saving) return;
    
    try {
      setSaving(true);
      await plotElementsApi.update(element.id, {
        title,
        content,
        summary,
        notes,
        status,
        targetWords,
        mood,
        pov
      });
      
      setLastSaved(new Date());
      if (!isAutoSave) {
        // 显示保存成功提示
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/project/${projectId}`);
  };

  const getFontFamilyStyle = (family: string) => {
    switch (family) {
      case 'serif': return '"Times New Roman", "SimSun", serif';
      case 'sans-serif': return '"Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';
      case 'monospace': return '"Consolas", "Monaco", "Courier New", monospace';
      case 'kai': return '"KaiTi", "楷体", serif';
      case 'song': return '"SimSun", "宋体", serif';
      default: return '"Times New Roman", "SimSun", serif';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return '📚';
      case 'part': return '📖';
      case 'chapter': return '📄';
      case 'scene': return '🎬';
      case 'beat': return '🎵';
      default: return '📝';
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">章节未找到</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            返回项目
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex overflow-hidden">
      {/* 左侧边栏 */}
      {showSidebar && (
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-2xl">{getTypeIcon(element.type)}</span>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{element.type === 'chapter' ? '章节' : '场景'}编辑</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {wordCount.toLocaleString()} 字
                  {targetWords && ` / ${targetWords.toLocaleString()} 字`}
                </p>
              </div>
            </div>
            
            {/* 进度条 */}
            {targetWords && (
              <div className="mb-4">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-black dark:bg-white rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (wordCount / targetWords) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round((wordCount / targetWords) * 100)}% 完成
                </div>
              </div>
            )}

            {/* 保存状态 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center space-x-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                >
                  <Save className="w-3 h-3" />
                  <span>{saving ? '保存中...' : '保存'}</span>
                </button>
                
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-600 dark:text-gray-400"
                  title={showPreview ? '编辑模式' : '预览模式'}
                >
                  {showPreview ? <Type className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </button>
              </div>
              
              {lastSaved && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* 侧边栏内容 */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* 标题编辑 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="输入标题..."
              />
            </div>

            {/* 章节概要预览 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  章节概要
                </label>
                <button
                  onClick={() => setShowSummaryModal(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  编辑
                </button>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 min-h-[60px]">
                {summary ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {summary}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    点击编辑添加章节概要...
                  </p>
                )}
              </div>
            </div>

            {/* 创作笔记预览 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  创作笔记
                </label>
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  编辑
                </button>
              </div>
              <div className="p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 min-h-[60px]">
                {notes ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    点击编辑添加创作笔记...
                  </p>
                )}
              </div>
            </div>

            {/* 基本信息 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                章节设置
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    状态
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="planned">计划中</option>
                    <option value="outlined">已大纲</option>
                    <option value="drafted">草稿</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    目标字数
                  </label>
                  <input
                    type="number"
                    value={targetWords || ''}
                    onChange={(e) => setTargetWords(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="设置目标字数"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    基调/氛围
                  </label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="如：紧张、温馨、悲伤"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    视角
                  </label>
                  <input
                    type="text"
                    value={pov}
                    onChange={(e) => setPov(e.target.value)}
                    placeholder="如：第一人称、第三人称"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 相关角色 */}
            {characters.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  相关角色
                </h3>
                <div className="space-y-2">
                  {characters.slice(0, 5).map((character) => (
                    <div key={character.id} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{character.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{character.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 相关设定 */}
            {worldSettings.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  相关设定
                </h3>
                <div className="space-y-2">
                  {worldSettings.slice(0, 5).map((setting) => (
                    <div key={setting.id} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{setting.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{setting.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 主编辑区域 */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* 侧边栏切换按钮 */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-400"
          title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
        >
          {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* 字体设置按钮 */}
        {!showPreview && (
          <button
            onClick={() => setShowFontPanel(!showFontPanel)}
            className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-400"
            title="字体设置"
          >
            <Type className="w-4 h-4" />
          </button>
        )}

        {/* 字体设置面板 */}
        {showFontPanel && !showPreview && (
          <div className="absolute top-16 right-4 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 w-64">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">字体设置</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  字体
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="serif">衬线字体 (Times New Roman)</option>
                  <option value="sans-serif">无衬线字体 (Helvetica)</option>
                  <option value="monospace">等宽字体 (Consolas)</option>
                  <option value="kai">楷体</option>
                  <option value="song">宋体</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  字号 ({fontSize}px)
                </label>
                <input
                  type="range"
                  min="14"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>14px</span>
                  <span>24px</span>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* 编辑器内容区域 */}
        <div className="flex-1 flex flex-col h-full">
          {showPreview ? (
            // 预览模式
            <div className="flex-1 p-12 overflow-y-auto h-full">
              <div className="max-w-4xl mx-auto">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h1 className="text-3xl font-bold mb-6">{title}</h1>
                  {summary && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-2">章节概要</h3>
                      <p className="text-gray-700 dark:text-gray-300">{summary}</p>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed text-lg">
                    {content}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 编辑模式 - 沉浸式写作
            <div className="flex-1 flex flex-col h-full">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 resize-none border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white leading-relaxed"
                placeholder="开始你的创作..."
                style={{ 
                  fontFamily: getFontFamilyStyle(fontFamily),
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.8',
                  padding: '80px 60px 60px 80px' // 上 右 下 左
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 章节概要编辑Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">编辑章节概要</h3>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="简要描述这个章节的主要内容、关键情节点、人物关系变化等..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                rows={8}
              />
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创作笔记编辑Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">编辑创作笔记</h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录创作思路、待修改的地方、灵感想法、角色发展计划等..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                rows={8}
              />
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};