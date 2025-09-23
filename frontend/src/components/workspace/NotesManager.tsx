import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, StickyNote, Tag } from 'lucide-react';
import type { ProjectNote } from '../../types';
import { projectNotesApi } from '../../services/api';

interface NotesManagerProps {
  projectId: string;
}

const categoryLabels = {
  inspiration: '灵感记录',
  research: '资料研究',
  todo: '待办事项',
  idea: '创意想法',
  reference: '参考资料'
};

export const NotesManager: React.FC<NotesManagerProps> = ({ projectId }) => {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [projectId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await projectNotesApi.getByProject(projectId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inspiration': return 'text-purple-600 bg-purple-100';
      case 'research': return 'text-blue-600 bg-blue-100';
      case 'todo': return 'text-red-600 bg-red-100';
      case 'idea': return 'text-green-600 bg-green-100';
      case 'reference': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <h2 className="text-2xl font-bold text-gray-900">项目笔记</h2>
          <p className="text-gray-600">记录灵感、想法和创作资料</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加笔记</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索笔记..."
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
        <div className="relative">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white w-full"
          >
            <option value="all">所有标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Notes Content */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {notes.length === 0 ? '还没有笔记' : '没有找到匹配的笔记'}
          </h3>
          <p className="text-gray-600 mb-4">
            {notes.length === 0 ? '开始记录你的创作想法吧' : '尝试调整搜索条件'}
          </p>
          {notes.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              创建笔记
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black hover:border-2 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{note.title}</h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                    {categoryLabels[note.category as keyof typeof categoryLabels] || note.category}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-6 mb-4">
                {note.content}
              </p>
              
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                创建于 {formatDate(note.createdAt)}
                {note.updatedAt !== note.createdAt && (
                  <span> • 更新于 {formatDate(note.updatedAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};