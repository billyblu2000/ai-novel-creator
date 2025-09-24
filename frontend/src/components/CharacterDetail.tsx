import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, User, BookOpen, Calendar } from 'lucide-react';
import type { Character, PlotElement } from '../types';
import { charactersApi, plotElementsApi } from '../services/api';
import { EditCharacterModal } from './EditCharacterModal';

interface CharacterDetailProps {
  characterId: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CharacterDetail: React.FC<CharacterDetailProps> = ({
  characterId,
  onBack,
  onEdit,
  onDelete
}) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [relatedPlotElements, setRelatedPlotElements] = useState<PlotElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCharacterDetail();
  }, [characterId]);

  const loadCharacterDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 加载角色详情
      const characterData = await charactersApi.getById(characterId);
      setCharacter(characterData);
      
      // 加载相关的情节元素
      if (characterData.plotElements && characterData.plotElements.length > 0) {
        const plotElementIds = characterData.plotElements.map(pe => pe.plotElement?.id).filter(Boolean);
        const plotElements: PlotElement[] = [];
        
        // 获取每个情节元素的详细信息
        for (const id of plotElementIds) {
          if (id) {
            try {
              const plotElement = await plotElementsApi.getById(id);
              plotElements.push(plotElement);
            } catch (err) {
              console.error(`Error loading plot element ${id}:`, err);
            }
          }
        }
        
        setRelatedPlotElements(plotElements);
      }
    } catch (err) {
      console.error('Error loading character detail:', err);
      setError('加载角色详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCharacter = async (id: string, data: any) => {
    try {
      const updatedCharacter = await charactersApi.update(id, data);
      setCharacter(updatedCharacter);
      if (onEdit) onEdit();
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  };

  const handleDeleteCharacter = async () => {
    if (!character) return;
    
    if (!confirm(`确定要删除角色"${character.name}"吗？此操作无法撤销。`)) {
      return;
    }

    try {
      await charactersApi.delete(character.id);
      if (onDelete) onDelete();
      onBack();
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'text-blue-600 bg-blue-100';
      case 'antagonist': return 'text-red-600 bg-red-100';
      case 'supporting': return 'text-green-600 bg-green-100';
      case 'minor': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'protagonist': return '主角';
      case 'antagonist': return '反派';
      case 'supporting': return '配角';
      case 'minor': return '次要';
      default: return role;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'text-purple-600 bg-purple-100';
      case 'part': return 'text-blue-600 bg-blue-100';
      case 'chapter': return 'text-green-600 bg-green-100';
      case 'scene': return 'text-yellow-600 bg-yellow-100';
      case 'beat': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'book': return '书';
      case 'part': return '部';
      case 'chapter': return '章';
      case 'scene': return '场景';
      case 'beat': return '节拍';
      default: return type;
    }
  };

  const getImportanceBackground = (importance: number) => {
    if (importance >= 8) return 'bg-gray-100';
    if (importance >= 6) return 'bg-slate-50';
    if (importance >= 4) return 'bg-gray-50';
    return 'bg-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error || '角色不存在'}
        </h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          返回角色列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="返回角色列表"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">角色详情</h2>
            <p className="text-gray-600">查看和管理角色信息</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>编辑</span>
          </button>
          <button
            onClick={handleDeleteCharacter}
            className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>删除</span>
          </button>
        </div>
      </div>

      {/* Character Info Card */}
      <div className={`border-2 border-gray-200 rounded-lg p-6 ${getImportanceBackground(character.importance)}`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{character.name}</h1>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(character.role)}`}>
                  {getRoleText(character.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Character Description */}
        {character.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">角色描述</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {character.description}
              </p>
            </div>
          </div>
        )}

        {/* Character Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>创建时间: {new Date(character.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>更新时间: {new Date(character.updatedAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>相关情节: {relatedPlotElements.length} 个</span>
          </div>
        </div>
      </div>

      {/* Related Plot Elements */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">相关情节</h3>
        
        {relatedPlotElements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">该角色还没有关联任何情节</p>
          </div>
        ) : (
          <div className="space-y-3">
            {relatedPlotElements.map((plotElement) => {
              // 找到该角色在此情节中的关联信息
              const characterRelation = character.plotElements?.find(
                pe => pe.plotElement?.id === plotElement.id
              );
              
              return (
                <div
                  key={plotElement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{plotElement.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(plotElement.type)}`}>
                          {getTypeText(plotElement.type)}
                        </span>
                        {characterRelation?.role && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                            {characterRelation.role}
                          </span>
                        )}
                      </div>
                      
                      {plotElement.summary && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {plotElement.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>状态: {plotElement.status}</span>
                        {plotElement.wordCount > 0 && (
                          <span>{plotElement.wordCount.toLocaleString()} 字</span>
                        )}
                        {characterRelation?.importance && (
                          <span>在此情节中的重要性: {characterRelation.importance}/10</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditCharacterModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateCharacter}
        character={character}
      />
    </div>
  );
};