import { join, basename } from 'path';
import { existsSync } from 'fs';

import fse from 'fs-extra';
import chalk from 'chalk';
import {
  Action,
  getCacheConfig,
  setCacheConfigAsync,
  type ActionTargetConfig,
  isRemotePath,
  isDev,
} from '@ldk/shared';

import { cloneRepoWithOra, formatRepoUrl, parseRepoUrl, updateRepoWithOra } from './repository.js';
import { OFFICIAL_TEMPLATES, TEMPLATE_CACHE_DIR, TEMPLATE_IGNORE_DIRS_RE } from './constant.js';

export interface TemplateConfig extends ActionTargetConfig {
  url: string;
  branch: string;
  temp: string;
  path: string;
}

export class TemplateManager extends Action<TemplateConfig> {
  templates: TemplateConfig[];
  constructor(public projectPath = 'project') {
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
    await this.genTemplates(
      OFFICIAL_TEMPLATES.concat(
        isDev()
          ? [
              'https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git',
              'https://github.com/grey-coat/virtual-scroll-list-liudingkang-build-test',
            ]
          : [],
      ),
    );
  }
  async genTemplates(tempPaths: string[]) {
    return Promise.all(tempPaths.map(this.genTemplate.bind(this)));
  }
  async genTemplate(tempPath: string) {
    tempPath = formatRepoUrl(tempPath);
    if (this.has(tempPath)) return this.get(tempPath) as TemplateConfig;

    const tempConfig = {
      name: tempPath,
      version: '',
      path: '',
      local: '',
      ...parseRepoUrl(tempPath),
    };
    this.add(tempConfig);
    return tempConfig;
  }
  async invokeTemplate(nameOrPath: string) {
    const tempConfig = await this.addTemplate(nameOrPath);
    if (tempConfig === undefined) return;
    const { path } = tempConfig;
    await fse.remove(this.projectPath);
    await fse.copy(path, this.projectPath, {
      filter: src => !TEMPLATE_IGNORE_DIRS_RE.test(src),
    });
    console.log(chalk.green('Template invoked'));
    await setCacheConfigAsync();
  }
  async addTemplate(nameOrPath: string) {
    const tempConfig = await this.genTemplate(nameOrPath);
    const { url, temp, name } = tempConfig;
    let { local, path } = tempConfig;
    if (!isRemotePath(name)) {
      tempConfig.local = local = name;
      tempConfig.path = path = join(local, temp);
      console.log('success');
      return tempConfig;
    }
    tempConfig.local = local = join(TEMPLATE_CACHE_DIR, basename(url));
    tempConfig.path = path = join(local, temp);
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
  getTemplate(nameOrPath: string) {
    const name = formatRepoUrl(nameOrPath);
    const tempConfig = this.get(name);
    if (tempConfig === undefined) {
      return;
    }
    return tempConfig;
  }
  async removeTemplate(nameOrPath: string) {
    const tempConfig = this.getTemplate(nameOrPath);
    if (tempConfig === undefined) return;
    const { path, name } = tempConfig;
    if (!existsSync(path)) {
      console.log(chalk.red(`${name} does not exist`));
      return;
    }
    if (isRemotePath(name)) {
      await fse.remove(path);
    }
    this.remove(name);
  }
  async removeAllTemplates() {
    this.removeAll();
    if (existsSync(TEMPLATE_CACHE_DIR)) {
      await fse.remove(TEMPLATE_CACHE_DIR);
    }
  }
}
