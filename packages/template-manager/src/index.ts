import { join, basename } from 'path';
import { existsSync } from 'fs';

import fse from 'fs-extra';
import chalk from 'chalk';
import { Action, getCacheConfig, setCacheConfigAsync, type ActionTargetConfig } from '@ldk/shared';

import {
  cloneRepoWithOra,
  formatRepoUrl,
  getRepoDirName,
  parseRepoUrl,
  updateRepoWithOra,
} from './repository.js';
import {
  DEFAULT_BRANCH,
  OFFICIAL_TEMPLATES,
  TEMPLATE_CACHE_DIR,
  TEMPLATE_IGNORE_DIRS_RE,
} from './constant.js';

export interface TemplateConfig extends ActionTargetConfig {
  url: string;
  branch: string;
  temp: string;
  path: string;
}

export class TemplateManager extends Action<TemplateConfig> {
  templates: TemplateConfig[];
  constructor(public projectPath = 'template') {
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
    if (this.has(tempPath)) return this.get(tempPath) as TemplateConfig;
    const dirName = getRepoDirName(tempPath);
    const { url, branch, temp } = parseRepoUrl(tempPath);
    const title = `${dirName}${DEFAULT_BRANCH === branch ? '' : `(${branch})`}`;

    const tempConfig = {
      name: tempPath,
      title,
      version: '',
      path: '',
      local: '',
      url,
      branch,
      temp,
    };
    this.add(tempConfig);
    return tempConfig;
  }
  async invokeTemplate(name: string) {
    const tempConfig = await this.addTemplate(name);
    if (tempConfig === undefined) return;
    const { path } = tempConfig;
    await fse.remove(this.projectPath);
    await fse.copy(path, this.projectPath, {
      filter: src => !TEMPLATE_IGNORE_DIRS_RE.test(src),
    });
    console.log(chalk.green('Template invoked'));
    await setCacheConfigAsync();
  }
  async addTemplate(name: string) {
    const tempConfig = await this.genTemplate(name);
    const { url, temp } = tempConfig;
    let { local, path } = tempConfig;
    if (local === '') {
      tempConfig.local = local = join(TEMPLATE_CACHE_DIR, basename(url));
      tempConfig.path = path = join(local, temp);
    }
    if (existsSync(local)) {
      await updateRepoWithOra(tempConfig, !existsSync(path));
    } else {
      try {
        await cloneRepoWithOra(tempConfig);
      } catch (error) {
        return;
      }
    }
    return tempConfig;
  }
  getTemplate(name: string) {
    name = formatRepoUrl(name);
    const tempConfig = this.get(name);
    if (tempConfig === undefined) {
      console.log(chalk.red(`${name} does not exist`));
      return;
    }
    return tempConfig;
  }
  async removeTemplate(name: string) {
    const tempConfig = this.getTemplate(name);
    if (tempConfig === undefined) return;
    const { path } = tempConfig;
    if (!existsSync(path)) {
      console.log(chalk.red(`${name} does not exist`));
      return;
    }
    await fse.remove(path);
    this.remove(name);
  }
  async removeAllTemplates() {
    this.removeAll();
    if (existsSync(TEMPLATE_CACHE_DIR)) {
      await fse.remove(TEMPLATE_CACHE_DIR);
    }
  }
}
