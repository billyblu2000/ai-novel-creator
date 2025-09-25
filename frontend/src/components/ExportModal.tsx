import React, { useState } from 'react';
import { X, Download, FileText, Hash, BookOpen, StickyNote, Loader2 } from 'lucide-react';
import type { Project } from '../types';
import { exportService, type ExportOptions } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'txt',
    includeMetadata: true,
    includeSummary: true,
    includeNotes: false
  });
  const [exporting, setExporting] = useState(false);

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const result = await exportService.exportProject(project, options);
      exportService.downloadFile(result);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">导出项目</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              导出格式
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                options.format === 'txt' 
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="txt"
                  checked={options.format === 'txt'}
                  onChange={(e) => handleOptionChange('format', e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">TXT</span>
                </div>
              </label>

              <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                options.format === 'markdown' 
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}>
                <input
                  type="radio"
                  name="format"
                  value="markdown"
                  checked={options.format === 'markdown'}
                  onChange={(e) => handleOptionChange('format', e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Markdown</span>
                </div>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              导出选项
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeMetadata}
                  onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded focus:ring-black dark:focus:ring-white"
                />
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">包含项目元数据</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSummary}
                  onChange={(e) => handleOptionChange('includeSummary', e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded focus:ring-black dark:focus:ring-white"
                />
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">包含章节摘要</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeNotes}
                  onChange={(e) => handleOptionChange('includeNotes', e.target.checked)}
                  className="w-4 h-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded focus:ring-black dark:focus:ring-white"
                />
                <div className="flex items-center space-x-2">
                  <StickyNote className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">包含创作笔记</span>
                </div>
              </label>
            </div>
          </div>

          {/* Export Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">导出说明</p>
                <p>• 如果章节下有场景，将自动拼合场景内容作为章节内容</p>
                <p>• 导出将按照情节结构的层级顺序组织内容</p>
                <p>• 当前项目字数：{project.wordCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center space-x-2 px-6 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>导出中...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>开始导出</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};