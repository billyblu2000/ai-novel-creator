export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  title: string;
  description?: string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}