import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  project: Project;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planning' | 'writing' | 'editing' | 'completed'>('planning');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setStatus(project.status);
      setWordCount(project.wordCount || 0);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        wordCount
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">编辑项目</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              项目标题
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors"
              placeholder="输入项目标题..."
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              项目描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black resize-none transition-colors"
              placeholder="输入项目描述..."
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              项目状态
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors"
            >
              <option value="planning">规划中</option>
              <option value="writing">写作中</option>
              <option value="editing">编辑中</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div>
            <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">
              字数统计
            </label>
            <input
              type="number"
              id="wordCount"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black transition-colors"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};