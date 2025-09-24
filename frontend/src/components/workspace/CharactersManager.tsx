import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import type { Character, CreateCharacterData, UpdateCharacterData } from '../../types';
import { charactersApi } from '../../services/api';
import { EditCharacterModal } from '../EditCharacterModal';
import { CharacterDetail } from '../CharacterDetail';
import { useTheme } from '../../contexts/ThemeContext';

interface CharactersManagerProps {
  projectId: string;
}

export const CharactersManager: React.FC<CharactersManagerProps> = ({ projectId }) => {
  useTheme(); // 确保主题上下文可用
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    loadCharacters();
  }, [projectId]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await charactersApi.getByProject(projectId);
      setCharacters(data);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCharacter = async (id: string, data: UpdateCharacterData) => {
    try {
      if (editingCharacter) {
        // 更新现有角色
        const updatedCharacter = await charactersApi.update(id, data);
        setCharacters(prev => prev.map(char => 
          char.id === id ? updatedCharacter : char
        ));
      } else {
        // 创建新角色
        const newCharacter = await charactersApi.create(data as CreateCharacterData);
        setCharacters(prev => [newCharacter, ...prev]);
      }
    } catch (error) {
      console.error('Error saving character:', error);
      throw error;
    }
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setShowEditModal(true);
  };



  const handleDeleteCharacter = async (id: string, name: string) => {
    if (!confirm(`确定要删除角色"${name}"吗？此操作无法撤销。`)) {
      return;
    }

    try {
      await charactersApi.delete(id);
      setCharacters(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const handleCharacterClick = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedCharacterId(null);
    setViewMode('list');
  };

  const handleCharacterUpdated = () => {
    loadCharacters(); // 重新加载角色列表
  };

  const handleCharacterDeleted = () => {
    loadCharacters(); // 重新加载角色列表
    handleBackToList(); // 返回列表视图
  };

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || character.role === selectedRole;
    return matchesSearch && matchesRole;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  // 如果是详情视图，显示角色详情
  if (viewMode === 'detail' && selectedCharacterId) {
    return (
      <CharacterDetail
        characterId={selectedCharacterId}
        onBack={handleBackToList}
        onEdit={handleCharacterUpdated}
        onDelete={handleCharacterDeleted}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">角色管理</h2>
          <p className="text-gray-600 dark:text-gray-400">管理小说中的所有角色</p>
        </div>
        <button
          onClick={() => {
                setEditingCharacter(null);
                setShowEditModal(true);
              }}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>添加角色</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索角色..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-black dark:focus:border-white focus:border-2 transition-colors appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full"
          >
          <option value="all">所有角色</option>
          <option value="protagonist">主角</option>
          <option value="antagonist">反派</option>
          <option value="supporting">配角</option>
          <option value="minor">次要角色</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {characters.length === 0 ? '还没有角色' : '没有找到匹配的角色'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {characters.length === 0 ? '开始创建你的第一个角色吧' : '尝试调整搜索条件'}
          </p>
          {characters.length === 0 && (
            <button
              onClick={() => {
              setEditingCharacter(null);
              setShowEditModal(true);
            }}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-md transition-colors"
            >
              创建角色
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <div 
              key={character.id} 
              onClick={() => handleCharacterClick(character.id)}
              className={`border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-black dark:hover:border-white hover:shadow-md transition-all duration-200 cursor-pointer ${
                character.importance >= 8 ? 'bg-gray-100 dark:bg-gray-700' 
                : character.importance >= 6 ? 'bg-slate-50 dark:bg-gray-750'
                : character.importance >= 4 ? 'bg-gray-50 dark:bg-gray-800'
                : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{character.name}</h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(character.role)}`}>
                    {getRoleText(character.role)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCharacter(character);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="编辑角色"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character.id, character.name);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="删除角色"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 mb-4">
                {character.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>重要性: {character.importance}/10</span>
                <span>{new Date(character.updatedAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <EditCharacterModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCharacter(null);
        }}
        onSubmit={handleSaveCharacter}
        character={editingCharacter}
      />
    </div>
  );
};