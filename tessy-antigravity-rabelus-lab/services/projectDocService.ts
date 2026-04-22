/**
 * ProjectDocService - Tessy Antigravity Core
 * Sprint 1.3 Parte B: IDE Procedural Documentation
 *
 * Generates automatic documentation for projects developed in Tessy IDE:
 * - README.md
 * - CHANGELOG.md
 * - API Documentation (from JSDoc/TSDoc)
 */

import { autoDocScheduler } from './autoDocScheduler';
import { db } from './dbService';
import { listDirectory, readFile } from './fileSystemService';
import { fetchFileContent, fetchRepositoryStructure, getGitHubToken } from './githubService';
import { getWorkspace, restoreWorkspaceHandle } from './workspaceService';

// Types
export interface ProjectDocConfig {
  projectId: string;
  includeReadme: boolean;
  includeChangelog: boolean;
  includeApiDocs: boolean;
  templateStyle: 'minimal' | 'standard' | 'detailed';
}

export interface FileAnalysis {
  path: string;
  language: string;
  exports: string[];
  imports: string[];
  functions: FunctionDoc[];
  classes: ClassDoc[];
}

export interface FunctionDoc {
  name: string;
  params: ParamDoc[];
  returns: string;
  description: string;
  line: number;
}

export interface ClassDoc {
  name: string;
  methods: FunctionDoc[];
  properties: PropertyDoc[];
  description: string;
  line: number;
}

export interface PropertyDoc {
  name: string;
  type: string;
  description: string;
}

export interface ParamDoc {
  name: string;
  type: string;
  description: string;
}

class ProjectDocService {
  private readonly supportedSourceExtensions = new Set(['ts', 'tsx', 'js', 'jsx']);

  private async collectProjectTemplates(projectId: string) {
    try {
      return await db.templates.where('projectId').equals(projectId).toArray();
    } catch {
      const templates = await db.templates.toArray();
      return templates.filter((template) => template.projectId === projectId);
    }
  }

  private async collectEcosystemSources(): Promise<string[]> {
    const targets = await autoDocScheduler.getTargets();
    const docs = await Promise.all(
      targets.map((target) => autoDocScheduler.getLatestDocument(target.id))
    );
    return docs
      .filter((doc): doc is NonNullable<typeof doc> => !!doc)
      .slice(0, 5)
      .map((doc) => `- **${doc.title}** (${doc.wordCount} palavras)`);
  }

  private async collectWorkspaceAnalyses(projectId: string): Promise<FileAnalysis[]> {
    const project = await db.projects.get(projectId);
    if (!project?.workspaceId) return [];

    const workspace = await getWorkspace(project.workspaceId);
    if (!workspace) return [];

    const handle = await restoreWorkspaceHandle(workspace.id);
    if (!handle) return [];

    const entries = await listDirectory(handle, '', 4);
    const files = this.flattenFileEntries(entries).filter((entry) =>
      this.supportedSourceExtensions.has(this.getFileExtension(entry.path))
    );

    const analyses: FileAnalysis[] = [];
    for (const entry of files) {
      if (entry.handle.kind !== 'file') continue;
      const content = await readFile(entry.handle as FileSystemFileHandle);
      analyses.push(await this.analyzeFile(entry.path, content));
    }
    return analyses;
  }

  private async collectGitHubAnalyses(projectId: string): Promise<FileAnalysis[]> {
    const project = await db.projects.get(projectId);
    if (!project?.githubRepo) return [];

    const githubToken = await getGitHubToken();
    if (!githubToken) return [];

    const structure = await fetchRepositoryStructure(githubToken, project.githubRepo, 4);
    const filePaths = this.flattenGitHubStructure(structure.items || []).filter((item) =>
      this.supportedSourceExtensions.has(this.getFileExtension(item.path))
    );

    const analyses: FileAnalysis[] = [];
    for (const item of filePaths) {
      const file = await fetchFileContent(githubToken, project.githubRepo, item.path);
      if (!file.content) continue;
      analyses.push(await this.analyzeFile(item.path, file.content));
    }
    return analyses;
  }

  private flattenFileEntries(
    entries: Array<{ path: string; kind: string; handle: FileSystemHandle; children?: any[] }>
  ): Array<{ path: string; kind: string; handle: FileSystemHandle; children?: any[] }> {
    return entries.flatMap((entry) => {
      if (entry.kind === 'directory') {
        return this.flattenFileEntries(entry.children || []);
      }
      return [entry];
    });
  }

  private flattenGitHubStructure(items: any[]): Array<{ path: string; type: string }> {
    return items.flatMap((item) => {
      if (item.type === 'dir') {
        return this.flattenGitHubStructure(item.items || []);
      }
      return [item];
    });
  }

  private getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || '';
  }

  private renderAnalysisMarkdown(analyses: FileAnalysis[]): string {
    if (analyses.length === 0) {
      return 'Nenhum arquivo TypeScript/JavaScript documentavel foi encontrado no workspace ou GitHub conectado.\n';
    }

    let output = '';
    for (const analysis of analyses) {
      output += `## ${analysis.path}\n\n`;

      if (analysis.exports.length > 0) {
        output += `**Exports:** ${analysis.exports.join(', ')}\n\n`;
      }

      if (analysis.functions.length > 0) {
        output += `### Functions\n\n`;
        for (const fn of analysis.functions) {
          const signature = fn.params.map((param) => `${param.name}: ${param.type}`).join(', ');
          output += `- \`${fn.name}(${signature})\` -> ${fn.returns}\n`;
          if (fn.description) {
            output += `  ${fn.description}\n`;
          }
        }
        output += `\n`;
      }

      if (analysis.classes.length > 0) {
        output += `### Classes\n\n`;
        for (const cls of analysis.classes) {
          output += `- \`${cls.name}\`\n`;
          if (cls.description) {
            output += `  ${cls.description}\n`;
          }
        }
        output += `\n`;
      }
    }

    return output;
  }

  /**
   * Generate README.md for a project
   */
  async generateReadme(
    projectId: string,
    style: 'minimal' | 'standard' | 'detailed' = 'standard'
  ): Promise<string> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const conversations = await db.conversations.where('projectId').equals(projectId).toArray();

    const templates = await this.collectProjectTemplates(projectId);
    const ecosystemSources = await this.collectEcosystemSources();

    let readme = '';

    // Header
    readme += `# ${project.name}\n\n`;
    if (project.description) {
      readme += `${project.description}\n\n`;
    }

    // Badges (if detailed)
    if (style === 'detailed') {
      readme += `![Status](https://img.shields.io/badge/status-active-success.svg)\n`;
      readme += `![Conversations](https://img.shields.io/badge/conversations-${conversations.length}-blue.svg)\n\n`;
    }

    // Table of Contents (if standard or detailed)
    if (style !== 'minimal') {
      readme += `## 📋 Table of Contents\n\n`;
      readme += `- [About](#about)\n`;
      readme += `- [Getting Started](#getting-started)\n`;
      if (templates.length > 0) readme += `- [Templates](#templates)\n`;
      readme += `- [Usage](#usage)\n`;
      readme += `- [Development](#development)\n\n`;
    }

    // About
    readme += `## 🎯 About\n\n`;
    readme += `This project was developed using **Tessy Antigravity IDE**.\n\n`;
    readme += `**Created:** ${new Date(project.createdAt).toLocaleDateString()}\n`;
    readme += `**Last Updated:** ${new Date(project.updatedAt).toLocaleDateString()}\n\n`;

    // Getting Started
    readme += `## 🚀 Getting Started\n\n`;
    readme += `### Prerequisites\n\n`;
    readme += `\`\`\`bash\n`;
    readme += `# Add your prerequisites here\n`;
    readme += `npm install\n`;
    readme += `\`\`\`\n\n`;

    // Templates (if any)
    if (templates.length > 0) {
      readme += `## 📚 Templates\n\n`;
      readme += `This project includes ${templates.length} template(s):\n\n`;
      templates.forEach((t) => {
        readme += `- **${t.label}**`;
        if (t.description) readme += `: ${t.description}`;
        readme += `\n`;
      });
      readme += `\n`;
    }

    // Usage
    readme += `## 💻 Usage\n\n`;
    readme += `\`\`\`bash\n`;
    readme += `# Add usage examples here\n`;
    readme += `npm start\n`;
    readme += `\`\`\`\n\n`;

    // Development (if detailed)
    if (style === 'detailed') {
      readme += `## 🛠️ Development\n\n`;
      readme += `**Conversations:** ${conversations.length}\n\n`;
      readme += `This project was developed through iterative conversations in Tessy Antigravity.\n\n`;
      if (ecosystemSources.length > 0) {
        readme += `### Ecosystem Knowledge Base\n\n`;
        readme += `${ecosystemSources.join('\n')}\n\n`;
      }
    }

    // Footer
    readme += `---\n\n`;
    readme += `*Generated by Tessy Antigravity Auto-Documentation Engine*\n`;

    return readme;
  }

  /**
   * Generate CHANGELOG.md for a project
   */
  async generateChangelog(projectId: string): Promise<string> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const conversations = await db.conversations.where('projectId').equals(projectId).toArray();

    // Sort by date
    conversations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let changelog = '';

    // Header
    changelog += `# Changelog\n\n`;
    changelog += `All notable changes to **${project.name}** will be documented in this file.\n\n`;

    // Group by date
    const byDate = new Map<string, typeof conversations>();
    conversations.forEach((conv) => {
      const date = new Date(conv.createdAt).toISOString().split('T')[0];
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)?.push(conv);
    });

    // Generate entries
    byDate.forEach((convs, date) => {
      changelog += `## [${date}]\n\n`;
      convs.forEach((conv) => {
        const title = conv.title || 'Untitled conversation';
        changelog += `### ${title}\n\n`;
        if (conv.turns && conv.turns.length > 0) {
          const firstTurn = conv.turns[0];
          if (firstTurn?.userMessage) {
            const preview = firstTurn.userMessage.substring(0, 100);
            changelog += `- ${preview}${firstTurn.userMessage.length > 100 ? '...' : ''}\n`;
          }
        }
        changelog += `\n`;
      });
    });

    // Footer
    changelog += `---\n\n`;
    changelog += `*Generated by Tessy Antigravity Auto-Documentation Engine*\n`;

    return changelog;
  }

  /**
   * Analyze a code file for documentation extraction with JSDoc/TSDoc support
   */
  async analyzeFile(filePath: string, content: string): Promise<FileAnalysis> {
    const language = this.detectLanguage(filePath);

    const analysis: FileAnalysis = {
      path: filePath,
      language,
      exports: [],
      imports: [],
      functions: [],
      classes: [],
    };

    if (language !== 'typescript' && language !== 'javascript') {
      return analysis; // Only support TS/JS for now
    }

    const lines = content.split('\n');

    // Extract imports
    const importRegex = /^import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/;
    lines.forEach((line, _idx) => {
      const match = line.match(importRegex);
      if (match) {
        const imports = match[1] ? match[1].split(',').map((i) => i.trim()) : [match[2]];
        analysis.imports.push(...imports);
      }
    });

    // Extract exports
    const exportRegex = /^export\s+(default\s+)?(class|function|interface|type|const)\s+(\w+)/;
    lines.forEach((line, _idx) => {
      const match = line.match(exportRegex);
      if (match) {
        analysis.exports.push(match[3]);
      }
    });

    // Parse JSDoc comments and associate with code
    let currentComment = '';
    let _commentStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Start of JSDoc comment
      if (line.startsWith('/**')) {
        currentComment = line;
        _commentStartLine = i;
        continue;
      }

      // Continuation of JSDoc comment
      if (currentComment && line.startsWith('*')) {
        currentComment += `\n${line}`;
        continue;
      }

      // End of JSDoc comment
      if (currentComment && line.startsWith('*/')) {
        currentComment += `\n${line}`;

        // Parse the next non-empty line for code definition
        let codeLineIdx = i + 1;
        while (codeLineIdx < lines.length && !lines[codeLineIdx].trim()) {
          codeLineIdx++;
        }

        if (codeLineIdx < lines.length) {
          const codeLine = lines[codeLineIdx].trim();
          this.parseCodeWithComment(currentComment, codeLine, codeLineIdx + 1, analysis);
        }

        currentComment = '';
      }
    }

    return analysis;
  }

  /**
   * Parse a code line with its associated JSDoc comment
   */
  private parseCodeWithComment(
    comment: string,
    codeLine: string,
    lineNumber: number,
    analysis: FileAnalysis
  ): void {
    const description = this.extractDescription(comment);
    const params = this.extractJSDocParams(comment);
    const returns = this.extractReturns(comment);

    // Function declaration
    if (codeLine.match(/^(export\s+)?(async\s+)?function\s+(\w+)/)) {
      const match = codeLine.match(/function\s+(\w+)\s*\((.*?)\)/);
      if (match) {
        analysis.functions.push({
          name: match[1],
          description,
          params: params.length > 0 ? params : this.parseParams(match[2]),
          returns,
          line: lineNumber,
        });
      }
    }

    // Arrow function (const/let/var)
    else if (codeLine.match(/^(export\s+)?(const|let|var)\s+(\w+)\s*=\s*(async\s*)?\(/)) {
      const match = codeLine.match(/(const|let|var)\s+(\w+)/);
      if (match) {
        analysis.functions.push({
          name: match[2],
          description,
          params,
          returns,
          line: lineNumber,
        });
      }
    }

    // Class declaration
    else if (codeLine.match(/^(export\s+)?(default\s+)?class\s+(\w+)/)) {
      const match = codeLine.match(/class\s+(\w+)/);
      if (match) {
        analysis.classes.push({
          name: match[1],
          description,
          methods: [],
          properties: [],
          line: lineNumber,
        });
      }
    }
  }

  /**
   * Extract description from JSDoc comment
   */
  private extractDescription(comment: string): string {
    const lines = comment.split('\n');
    const descLines: string[] = [];

    for (const line of lines) {
      const cleaned = line.replace(/^\s*\*\s?/, '').trim();
      if (
        cleaned &&
        !cleaned.startsWith('@') &&
        !cleaned.startsWith('/**') &&
        !cleaned.startsWith('*/')
      ) {
        descLines.push(cleaned);
      } else if (cleaned.startsWith('@')) {
        break; // Stop at first tag
      }
    }

    return descLines.join(' ');
  }

  /**
   * Extract @param tags from JSDoc comment
   */
  private extractJSDocParams(comment: string): ParamDoc[] {
    const params: ParamDoc[] = [];
    const paramRegex = /@param\s+{([^}]+)}\s+(\[?(\w+)\]?)\s*-?\s*(.*)/g;
    // biome-ignore lint/suspicious/noAssignInExpressions: padrão idiomático RegExp.exec em loop
    let match: RegExpExecArray | null;
    // biome-ignore lint/suspicious/noAssignInExpressions: padrão idiomático RegExp.exec em loop
    while ((match = paramRegex.exec(comment)) !== null) {
      params.push({
        name: match[3],
        type: match[1],
        description: match[4],
      });
    }

    return params;
  }

  /**
   * Extract @returns tag from JSDoc comment
   */
  private extractReturns(comment: string): string {
    const match = comment.match(/@returns?\s+{([^}]+)}\s*(.*)/);
    return match ? `${match[1]} - ${match[2]}` : 'void';
  }

  /**
   * Generate API documentation from file analysis
   */
  async generateApiDocs(projectId: string): Promise<string> {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const workspaceAnalyses = await this.collectWorkspaceAnalyses(projectId);
    const analyses =
      workspaceAnalyses.length > 0
        ? workspaceAnalyses
        : await this.collectGitHubAnalyses(projectId);

    let apiDocs = '';
    apiDocs += `# API Documentation\n\n`;
    apiDocs += `*Auto-generated from connected source analysis*\n\n`;
    apiDocs += `Project: **${project.name}**\n\n`;
    apiDocs += this.renderAnalysisMarkdown(analyses);
    apiDocs += `---\n\n`;
    apiDocs += `*Generated by Tessy Antigravity Auto-Documentation Engine*\n`;

    return apiDocs;
  }

  /**
   * Save generated documentation to project using File System Access API
   */
  async saveDocumentation(
    projectId: string,
    type: 'readme' | 'changelog' | 'api',
    content: string
  ): Promise<void> {
    const fileName =
      type === 'readme' ? 'README.md' : type === 'changelog' ? 'CHANGELOG.md' : 'API.md';

    try {
      // Try to use File System Access API
      if ('showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'Markdown Files',
              accept: { 'text/markdown': ['.md'] },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        console.log(`✅ ${fileName} saved successfully via File System Access API`);
      } else {
        // Fallback: Save to IndexedDB as template
        await db.templates.add({
          id: `${projectId}-${type}-${Date.now()}`,
          projectId,
          category: 'Personalizado',
          label: fileName,
          description: `Auto-generated ${type} documentation`,
          content,
          isCustom: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        console.log(`⚠️ ${fileName} saved to IndexedDB (File System Access API not available)`);
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error saving documentation:', error);
        throw error;
      }
    }
  }

  // Helper methods
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      rs: 'rust',
      go: 'go',
    };
    return langMap[ext || ''] || 'unknown';
  }

  private parseParams(paramsStr: string): ParamDoc[] {
    if (!paramsStr.trim()) return [];

    return paramsStr.split(',').map((p) => {
      const trimmed = p.trim();
      const [name, type] = trimmed.includes(':') ? trimmed.split(':') : [trimmed, 'any'];
      return {
        name: name.trim(),
        type: type?.trim() || 'any',
        description: '',
      };
    });
  }
}

export const projectDocService = new ProjectDocService();
