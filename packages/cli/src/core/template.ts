import { join, basename } from 'path';
import { existsSync } from 'fs';

import fse from 'fs-extra';
import { glob } from 'glob';
import chalk from 'chalk';

import type { ActionTargetConfig } from '../common/action.js';
import { Action } from '../common/action.js';
import {
  OFFICIAL_TEMPLATES,
  TEMPLATE_CACHE_DIR,
  getCacheConfig,
  setCacheConfigAsync,
} from '../common/constant.js';
import {
  cloneRepoWithOra,
  formatRepoUrl,
  getRepoDirName,
  parseRepoUrl,
  updateRepoWithOra,
} from '../common/repository.js';
import { isPath } from '../common/index.js';

export interface TemplateConfig extends ActionTargetConfig {
  url: string;
  branch: string;
  temp: string;
}

export class TemplateManager extends Action<TemplateConfig> {
  templates: TemplateConfig[];
  constructor(public projectPath: string) {
    const cacheConfig = getCacheConfig();
    console.log(cacheConfig);
    const templates: TemplateConfig[] = cacheConfig.templates;
    super(templates);
    this.templates = templates;
  }
  async init() {
    await this.initTemplates();
    console.log(this.templates);
  }
  async initTemplates() {
    if (existsSync(TEMPLATE_CACHE_DIR)) {
      const tempPaths = await glob(`${TEMPLATE_CACHE_DIR}/*/`);
      await this.genTemplates(tempPaths);
    }
    await this.genTemplates(OFFICIAL_TEMPLATES);
  }
  async genTemplates(tempPaths: string[]) {
    return Promise.all(tempPaths.map(this.genTemplate.bind(this)));
  }
  async genTemplate(tempPath: string) {
    tempPath = formatRepoUrl(tempPath);
    const dirName = getRepoDirName(tempPath);
    if (this.has(dirName)) return;
    const { url, branch, temp } = parseRepoUrl(tempPath);
    this.add({
      name: dirName,
      title: dirName,
      version: '',
      path: '',
      url,
      branch,
      temp,
    });
  }
  async invokeTemplate(nameOrPath: string) {
    let name = nameOrPath;
    // 处理未下载的模板
    if (isPath(nameOrPath)) {
      await this.genTemplate(nameOrPath);
      name = getRepoDirName(nameOrPath);
    }
    const tempConfig = this.get(name);
    if (typeof tempConfig === 'undefined') return;
    const { path: repoPath, url, temp } = tempConfig;
    const localRepoPath = join(TEMPLATE_CACHE_DIR, basename(url));
    if (repoPath === '') {
      tempConfig.path = localRepoPath;
    }
    if (!existsSync(localRepoPath)) {
      try {
        await cloneRepoWithOra(url, localRepoPath);
      } catch (error) {
        return;
      }
    } else {
      await updateRepoWithOra(localRepoPath);
    }
    await fse.remove(this.projectPath);
    const localTempPath = localRepoPath + temp;
    await fse.copy(localTempPath, this.projectPath);
    console.log(chalk.green('Template invoked'));
    await setCacheConfigAsync();
  }
}
