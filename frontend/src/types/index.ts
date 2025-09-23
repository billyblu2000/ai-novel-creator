// 基础项目类型
export interface Project {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  wordCount: number;
  targetWords?: number;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  characters?: Character[];
  worldSettings?: WorldSetting[];
  plotElements?: PlotElement[];
  timelines?: Timeline[];
  notes?: ProjectNote[];
  _count?: {
    characters: number;
    worldSettings: number;
    plotElements: number;
    timelines: number;
    notes: number;
  };
}

// 角色类型
export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  plotElements?: PlotElementCharacter[];
}

// 世界设定类型
export interface WorldSetting {
  id: string;
  projectId: string;
  category: 'background' | 'culture' | 'geography' | 'technology' | 'magic' | 'society' | 'history';
  title: string;
  content: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  plotElements?: PlotElementSetting[];
}

// 情节元素类型
export interface PlotElement {
  id: string;
  projectId: string;
  title: string;
  type: 'book' | 'part' | 'chapter' | 'scene' | 'beat';
  order: number;
  parentId?: string;
  summary?: string;
  content: string;
  notes?: string;
  status: 'planned' | 'outlined' | 'drafted' | 'completed';
  wordCount: number;
  targetWords?: number;
  mood?: string;
  pov?: string;
  createdAt: string;
  updatedAt: string;
  // 关联数据
  parent?: PlotElement;
  children?: PlotElement[];
  characters?: PlotElementCharacter[];
  settings?: PlotElementSetting[];
  timelines?: PlotElementTimeline[];
}

// 时间线类型
export interface Timeline {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  storyDate?: string;
  timeType: 'absolute' | 'relative' | 'symbolic';
  chronOrder: number;
  importance: number;
  duration?: string;
  createdAt: string;
  updatedAt: string;
  plotElements?: PlotElementTimeline[];
}

// 项目笔记类型
export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  category: 'inspiration' | 'research' | 'todo' | 'idea' | 'reference';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 关联关系类型
export interface PlotElementCharacter {
  id: string;
  plotElementId: string;
  characterId: string;
  role?: string;
  importance: number;
  character?: Character;
  plotElement?: PlotElement;
}

export interface PlotElementSetting {
  id: string;
  plotElementId: string;
  settingId: string;
  relevance?: string;
  setting?: WorldSetting;
  plotElement?: PlotElement;
}

export interface PlotElementTimeline {
  id: string;
  plotElementId: string;
  timelineId: string;
  relationship: 'main' | 'flashback' | 'foreshadowing' | 'parallel';
  description?: string;
  plotElement?: PlotElement;
  timeline?: Timeline;
}

// API请求类型
export interface CreateProjectData {
  title: string;
  description?: string;
  genre?: string;
  targetWords?: number;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  genre?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  targetWords?: number;
}

export interface CreateCharacterData {
  projectId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  importance?: number;
}

export interface UpdateCharacterData {
  name?: string;
  role?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description?: string;
  importance?: number;
}

export interface CreateWorldSettingData {
  projectId: string;
  category: 'background' | 'culture' | 'geography' | 'technology' | 'magic' | 'society' | 'history';
  title: string;
  content: string;
  importance?: number;
}

export interface UpdateWorldSettingData {
  category?: 'background' | 'culture' | 'geography' | 'technology' | 'magic' | 'society' | 'history';
  title?: string;
  content?: string;
  importance?: number;
}

export interface CreatePlotElementData {
  projectId: string;
  title: string;
  type: 'book' | 'part' | 'chapter' | 'scene' | 'beat';
  parentId?: string;
  summary?: string;
  content?: string;
  notes?: string;
  status?: 'planned' | 'outlined' | 'drafted' | 'completed';
  targetWords?: number;
  mood?: string;
  pov?: string;
  order?: number;
}

export interface UpdatePlotElementData {
  title?: string;
  type?: 'book' | 'part' | 'chapter' | 'scene' | 'beat';
  order?: number;
  parentId?: string;
  summary?: string;
  content?: string;
  notes?: string;
  status?: 'planned' | 'outlined' | 'drafted' | 'completed';
  targetWords?: number;
  mood?: string;
  pov?: string;
}

export interface CreateTimelineData {
  projectId: string;
  name: string;
  description?: string;
  storyDate?: string;
  timeType: 'absolute' | 'relative' | 'symbolic';
  chronOrder?: number;
  importance?: number;
  duration?: string;
}

export interface UpdateTimelineData {
  name?: string;
  description?: string;
  storyDate?: string;
  timeType?: 'absolute' | 'relative' | 'symbolic';
  chronOrder?: number;
  importance?: number;
  duration?: string;
}

export interface CreateProjectNoteData {
  projectId: string;
  title: string;
  content: string;
  category: 'inspiration' | 'research' | 'todo' | 'idea' | 'reference';
  tags?: string[];
}

export interface UpdateProjectNoteData {
  title?: string;
  content?: string;
  category?: 'inspiration' | 'research' | 'todo' | 'idea' | 'reference';
  tags?: string[];
}

// 项目统计类型
export interface ProjectStats {
  characters: number;
  worldSettings: number;
  plotElements: {
    total: number;
    totalWords: number;
    byStatus: Record<string, number>;
  };
  timelines: number;
  notes: number;
  project: {
    wordCount: number;
    targetWords?: number;
    progress: number;
  };
}