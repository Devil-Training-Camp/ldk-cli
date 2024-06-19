import { join, basename } from 'path';
import { existsSync } from 'fs';

import fse from 'fs-extra';
// import { glob } from 'glob';
import chalk from 'chalk';

import type { ActionTargetConfig } from '../common/action.js';
import { Action } from '../common/action.js';
import {
  DEFAULT_BRANCH,
  OFFICIAL_TEMPLATES,
  TEMPLATE_CACHE_DIR,
  TEMPLATE_IGNORE_DIRS_RE,
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
  path: string;
}

export class TemplateManager extends Action<TemplateConfig> {
  templates: TemplateConfig[];
  constructor(public projectPath: string) {
    const cacheConfig = getCacheConfig();
    const templates: TemplateConfig[] = cacheConfig.templates;
    super(templates);
    this.templates = templates;
  }
  async init() {
    await this.initTemplates();
    // console.log(this.templates);
  }
  async initTemplates() {
    await this.genTemplates(OFFICIAL_TEMPLATES);
  }
  async genTemplates(tempPaths: string[]) {
    return Promise.all(tempPaths.map(this.genTemplate.bind(this)));
  }
  async genTemplate(tempPath: string) {
    tempPath = formatRepoUrl(tempPath);
    const dirName = getRepoDirName(tempPath);
    if (this.has(tempPath)) return tempPath;
    const { url, branch, temp } = parseRepoUrl(tempPath);
    const title = `${dirName}${DEFAULT_BRANCH === branch ? '' : `(${branch})`}`;
    this.add({
      name: tempPath,
      title,
      version: '',
      path: '',
      local: '',
      url,
      branch,
      temp,
    });
    return tempPath;
  }
  async invokeTemplate(nameOrPath: string) {
    let name = nameOrPath;
    // 处理未下载的模板
    if (isPath(nameOrPath)) {
      name = await this.genTemplate(nameOrPath);
    }
    const tempConfig = this.get(name);
    if (typeof tempConfig === 'undefined') return;
    const { local, url, temp } = tempConfig;
    const localRepoPath = join(TEMPLATE_CACHE_DIR, basename(url));
    const localTempPath = join(localRepoPath, temp);
    if (local === '') {
      tempConfig.local = localRepoPath;
      tempConfig.path = localTempPath;
    }
    if (existsSync(localRepoPath)) {
      await updateRepoWithOra(tempConfig, !existsSync(localTempPath));
    } else {
      try {
        await cloneRepoWithOra(tempConfig);
      } catch (error) {
        return;
      }
    }
    await fse.remove(this.projectPath);
    await fse.copy(localTempPath, this.projectPath, {
      filter: src => !TEMPLATE_IGNORE_DIRS_RE.test(src),
    });
    console.log(chalk.green('Template invoked'));
    await setCacheConfigAsync();
  }
}
