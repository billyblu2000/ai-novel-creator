import type { Project, PlotElement } from '../types';
import { plotElementsApi } from './api';

export interface ExportOptions {
  format: 'txt' | 'markdown';
  includeMetadata?: boolean;
  includeSummary?: boolean;
  includeNotes?: boolean;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

interface HierarchyElement extends PlotElement {
  children: HierarchyElement[];
}

class ExportService {
  /**
   * 导出项目内容
   */
  async exportProject(project: Project, options: ExportOptions): Promise<ExportResult> {
    // 获取所有情节元素
    const plotElements = await plotElementsApi.getByProject(project.id);
    
    // 构建层级结构
    const hierarchy = this.buildHierarchy(plotElements);
    
    // 根据格式生成内容
    const content = options.format === 'markdown' 
      ? this.generateMarkdown(project, hierarchy, options)
      : this.generateTxt(project, hierarchy, options);
    
    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${project.title}_${timestamp}.${options.format}`;
    
    return {
      content,
      filename,
      mimeType: options.format === 'markdown' ? 'text/markdown' : 'text/plain'
    };
  }

  /**
   * 构建情节元素层级结构
   */
  private buildHierarchy(elements: PlotElement[]): HierarchyElement[] {
    const elementMap = new Map<string, HierarchyElement>();
    const rootElements: HierarchyElement[] = [];

    // 初始化所有元素
    elements.forEach(element => {
      elementMap.set(element.id, { ...element, children: [] });
    });

    // 构建层级关系
    elements.forEach(element => {
      const elementWithChildren = elementMap.get(element.id)!;
      
      if (element.parentId) {
        const parent = elementMap.get(element.parentId);
        if (parent) {
          parent.children.push(elementWithChildren);
        }
      } else {
        rootElements.push(elementWithChildren);
      }
    });

    // 按 order 排序
    this.sortByOrder(rootElements);
    rootElements.forEach(element => this.sortChildrenRecursively(element));

    return rootElements;
  }

  /**
   * 递归排序子元素
   */
  private sortChildrenRecursively(element: HierarchyElement): void {
    this.sortByOrder(element.children);
    element.children.forEach(child => this.sortChildrenRecursively(child));
  }

  /**
   * 按 order 字段排序
   */
  private sortByOrder(elements: HierarchyElement[]): void {
    elements.sort((a, b) => a.order - b.order);
  }

  /**
   * 生成 Markdown 格式内容
   */
  private generateMarkdown(
    project: Project, 
    hierarchy: HierarchyElement[], 
    options: ExportOptions
  ): string {
    let content = '';

    // 项目标题和元数据
    content += `# ${project.title}\n\n`;
    
    if (options.includeMetadata && project.description) {
      content += `${project.description}\n\n`;
    }

    if (options.includeMetadata) {
      content += `---\n\n`;
      if (project.genre) content += `**类型**: ${project.genre}\n\n`;
      if (project.targetWords) content += `**目标字数**: ${project.targetWords.toLocaleString()}\n\n`;
      content += `**当前字数**: ${project.wordCount.toLocaleString()}\n\n`;
      content += `**状态**: ${this.getStatusText(project.status)}\n\n`;
      content += `---\n\n`;
    }

    // 生成内容
    hierarchy.forEach(element => {
      content += this.generateElementMarkdown(element, 1, options);
    });

    return content;
  }

  /**
   * 生成单个元素的 Markdown 内容
   */
  private generateElementMarkdown(
    element: HierarchyElement, 
    level: number, 
    options: ExportOptions
  ): string {
    let content = '';
    const hasScenes = element.children.some(child => child.type === 'scene');

    // 标题
    const headerLevel = Math.min(level, 6);
    const headerPrefix = '#'.repeat(headerLevel);
    content += `${headerPrefix} ${element.title}\n\n`;

    // 摘要
    if (options.includeSummary && element.summary) {
      content += `*${element.summary}*\n\n`;
    }

    // 内容处理：如果有场景子元素，则忽略章节内容，拼合场景内容
    if (hasScenes) {
      // 拼合所有场景的内容
      element.children
        .filter(child => child.type === 'scene')
        .forEach(scene => {
          if (scene.content && scene.content.trim()) {
            content += `${scene.content.trim()}\n\n`;
          }
        });
    } else if (element.content && element.content.trim()) {
      // 如果没有场景，使用元素自身的内容
      content += `${element.content.trim()}\n\n`;
    }

    // 笔记
    if (options.includeNotes && element.notes && element.notes.trim()) {
      content += `> **笔记**: ${element.notes.trim()}\n\n`;
    }

    // 处理非场景的子元素
    element.children
      .filter(child => child.type !== 'scene' || !hasScenes)
      .forEach(child => {
        content += this.generateElementMarkdown(child, level + 1, options);
      });

    return content;
  }

  /**
   * 生成 TXT 格式内容
   */
  private generateTxt(
    project: Project, 
    hierarchy: HierarchyElement[], 
    options: ExportOptions
  ): string {
    let content = '';

    // 项目标题和元数据
    content += `${project.title}\n`;
    content += '='.repeat(project.title.length) + '\n\n';
    
    if (options.includeMetadata && project.description) {
      content += `${project.description}\n\n`;
    }

    if (options.includeMetadata) {
      content += '---\n\n';
      if (project.genre) content += `类型: ${project.genre}\n`;
      if (project.targetWords) content += `目标字数: ${project.targetWords.toLocaleString()}\n`;
      content += `当前字数: ${project.wordCount.toLocaleString()}\n`;
      content += `状态: ${this.getStatusText(project.status)}\n\n`;
      content += '---\n\n';
    }

    // 生成内容
    hierarchy.forEach(element => {
      content += this.generateElementTxt(element, 0, options);
    });

    return content;
  }

  /**
   * 生成单个元素的 TXT 内容
   */
  private generateElementTxt(
    element: HierarchyElement, 
    level: number, 
    options: ExportOptions
  ): string {
    let content = '';
    const hasScenes = element.children.some(child => child.type === 'scene');

    // 标题
    const indent = '  '.repeat(level);
    content += `${indent}${element.title}\n`;
    
    // 根据层级添加不同的分隔线
    if (level === 0) {
      content += '='.repeat(element.title.length) + '\n\n';
    } else if (level === 1) {
      content += '-'.repeat(element.title.length) + '\n\n';
    } else {
      content += '\n';
    }

    // 摘要
    if (options.includeSummary && element.summary) {
      content += `${indent}摘要: ${element.summary}\n\n`;
    }

    // 内容处理：如果有场景子元素，则忽略章节内容，拼合场景内容
    if (hasScenes) {
      // 拼合所有场景的内容
      element.children
        .filter(child => child.type === 'scene')
        .forEach(scene => {
          if (scene.content && scene.content.trim()) {
            content += `${scene.content.trim()}\n\n`;
          }
        });
    } else if (element.content && element.content.trim()) {
      // 如果没有场景，使用元素自身的内容
      content += `${element.content.trim()}\n\n`;
    }

    // 笔记
    if (options.includeNotes && element.notes && element.notes.trim()) {
      content += `${indent}[笔记: ${element.notes.trim()}]\n\n`;
    }

    // 处理非场景的子元素
    element.children
      .filter(child => child.type !== 'scene' || !hasScenes)
      .forEach(child => {
        content += this.generateElementTxt(child, level + 1, options);
      });

    return content;
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: string): string {
    switch (status) {
      case 'draft': return '草稿';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'archived': return '已归档';
      default: return status;
    }
  }

  /**
   * 下载文件
   */
  downloadFile(result: ExportResult): void {
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();