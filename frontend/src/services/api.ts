import axios from 'axios';
import type {
  Project, CreateProjectData, UpdateProjectData, ProjectStats,
  Character, CreateCharacterData, UpdateCharacterData,
  WorldSetting, CreateWorldSettingData, UpdateWorldSettingData,
  PlotElement, CreatePlotElementData, UpdatePlotElementData,
  Timeline, CreateTimelineData, UpdateTimelineData,
  ProjectNote, CreateProjectNoteData, UpdateProjectNoteData,
  PlotElementCharacter, PlotElementSetting, PlotElementTimeline
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并重定向到登录页
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 项目API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getStats: async (id: string): Promise<ProjectStats> => {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// 角色API
export const charactersApi = {
  getByProject: async (projectId: string): Promise<Character[]> => {
    const response = await api.get(`/characters/${projectId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Character> => {
    const response = await api.get(`/characters/detail/${id}`);
    return response.data;
  },

  create: async (data: CreateCharacterData): Promise<Character> => {
    const response = await api.post('/characters', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCharacterData): Promise<Character> => {
    const response = await api.put(`/characters/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/characters/${id}`);
  },
};

// 世界设定API
export const worldSettingsApi = {
  getByProject: async (projectId: string, category?: string): Promise<WorldSetting[]> => {
    const params = category ? { category } : {};
    const response = await api.get(`/world-settings/${projectId}`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<WorldSetting> => {
    const response = await api.get(`/world-settings/detail/${id}`);
    return response.data;
  },

  getCategories: async (projectId: string): Promise<string[]> => {
    const response = await api.get(`/world-settings/categories/${projectId}`);
    return response.data;
  },

  create: async (data: CreateWorldSettingData): Promise<WorldSetting> => {
    const response = await api.post('/world-settings', data);
    return response.data;
  },

  update: async (id: string, data: UpdateWorldSettingData): Promise<WorldSetting> => {
    const response = await api.put(`/world-settings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/world-settings/${id}`);
  },
};

// 情节元素API
export const plotElementsApi = {
  getByProject: async (projectId: string, type?: string, parentId?: string): Promise<PlotElement[]> => {
    const params: any = {};
    if (type) params.type = type;
    if (parentId !== undefined) params.parentId = parentId === null ? 'null' : parentId;
    const response = await api.get(`/plot-elements/${projectId}`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<PlotElement> => {
    const response = await api.get(`/plot-elements/detail/${id}`);
    return response.data;
  },

  create: async (data: CreatePlotElementData): Promise<PlotElement> => {
    const response = await api.post('/plot-elements', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePlotElementData): Promise<PlotElement> => {
    const response = await api.put(`/plot-elements/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/plot-elements/${id}`);
  },

  // 关联管理
  linkCharacter: async (plotElementId: string, characterId: string, role?: string, importance?: number): Promise<PlotElementCharacter> => {
    const response = await api.post(`/plot-elements/${plotElementId}/characters`, {
      characterId, role, importance
    });
    return response.data;
  },

  unlinkCharacter: async (plotElementId: string, characterId: string): Promise<void> => {
    await api.delete(`/plot-elements/${plotElementId}/characters/${characterId}`);
  },

  linkSetting: async (plotElementId: string, settingId: string, relevance?: string): Promise<PlotElementSetting> => {
    const response = await api.post(`/plot-elements/${plotElementId}/settings`, {
      settingId, relevance
    });
    return response.data;
  },

  unlinkSetting: async (plotElementId: string, settingId: string): Promise<void> => {
    await api.delete(`/plot-elements/${plotElementId}/settings/${settingId}`);
  },
};

// 时间线API
export const timelinesApi = {
  getByProject: async (projectId: string): Promise<Timeline[]> => {
    const response = await api.get(`/timelines/${projectId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Timeline> => {
    const response = await api.get(`/timelines/detail/${id}`);
    return response.data;
  },

  create: async (data: CreateTimelineData): Promise<Timeline> => {
    const response = await api.post('/timelines', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTimelineData): Promise<Timeline> => {
    const response = await api.put(`/timelines/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/timelines/${id}`);
  },

  // 关联管理
  linkPlotElement: async (timelineId: string, plotElementId: string, relationship: string, description?: string): Promise<PlotElementTimeline> => {
    const response = await api.post(`/timelines/${timelineId}/plot-elements`, {
      plotElementId, relationship, description
    });
    return response.data;
  },

  unlinkPlotElement: async (timelineId: string, plotElementId: string): Promise<void> => {
    await api.delete(`/timelines/${timelineId}/plot-elements/${plotElementId}`);
  },

  updatePlotElementRelation: async (timelineId: string, plotElementId: string, relationship: string, description?: string): Promise<PlotElementTimeline> => {
    const response = await api.put(`/timelines/${timelineId}/plot-elements/${plotElementId}`, {
      relationship, description
    });
    return response.data;
  },
};

// 项目笔记API
export const projectNotesApi = {
  getByProject: async (projectId: string, category?: string, tags?: string[]): Promise<ProjectNote[]> => {
    const params: any = {};
    if (category) params.category = category;
    if (tags && tags.length > 0) params.tags = tags;
    const response = await api.get(`/project-notes/${projectId}`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<ProjectNote> => {
    const response = await api.get(`/project-notes/detail/${id}`);
    return response.data;
  },

  getCategories: async (projectId: string): Promise<string[]> => {
    const response = await api.get(`/project-notes/categories/${projectId}`);
    return response.data;
  },

  getTags: async (projectId: string): Promise<string[]> => {
    const response = await api.get(`/project-notes/tags/${projectId}`);
    return response.data;
  },

  create: async (data: CreateProjectNoteData): Promise<ProjectNote> => {
    const response = await api.post('/project-notes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProjectNoteData): Promise<ProjectNote> => {
    const response = await api.put(`/project-notes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/project-notes/${id}`);
  },
};

export default api;