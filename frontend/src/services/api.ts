import axios from 'axios';
import type { Project, CreateProjectData, UpdateProjectData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsApi = {
  // 获取所有项目
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  // 获取单个项目
  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // 创建项目
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // 更新项目
  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  // 删除项目
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export default api;