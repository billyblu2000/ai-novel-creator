import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import type { Character } from '../../types';
import { charactersApi } from '../../services/api';

interface CharactersManagerProps {
  projectId: string;
}

export const CharactersManager: React.FC<CharactersManagerProps> = ({ projectId }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">角色管理</h2>
          <p className="text-gray-600">管理小说中的所有角色</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black focus:border-2 transition-colors appearance-none bg-white w-full"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {characters.length === 0 ? '还没有角色' : '没有找到匹配的角色'}
          </h3>
          <p className="text-gray-600 mb-4">
            {characters.length === 0 ? '开始创建你的第一个角色吧' : '尝试调整搜索条件'}
          </p>
          {characters.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              创建角色
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((character) => (
            <div key={character.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{character.name}</h3>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(character.role)}`}>
                    {getRoleText(character.role)}
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
              
              <p className="text-gray-600 text-sm line-clamp-4 mb-4">
                {character.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>重要程度: {character.importance}/10</span>
                <div className="w-16 h-1 bg-gray-200 rounded-full">
                  <div 
                    className="h-1 bg-black rounded-full transition-all duration-300"
                    style={{ width: `${character.importance * 10}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};