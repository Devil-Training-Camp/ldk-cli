import { join } from 'path';
import { existsSync } from 'fs';

import fse from 'fs-extra';
import { glob } from 'glob';
import chalk from 'chalk';

import type { ActionTargetConfig } from '../common/action.js';
import { Action } from '../common/action.js';
import { OFFICIAL_TEMPLATES, TEMPLATE_CACHE_DIR } from '../common/constant.js';
import { cloneRepoWithOra, getRepoDirName, updateRepoWithOra } from '../common/repository.js';
import { isPath, isRemotePath } from '../common/index.js';

export interface TemplateConfig extends ActionTargetConfig {}

export class TemplateManager extends Action<TemplateConfig> {
  templates: TemplateConfig[];
  constructor(public projectPath: string) {
    const templates: TemplateConfig[] = [];
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
    const dirName = getRepoDirName(tempPath);
    if (this.has(dirName)) return;
    this.add({
      name: dirName,
      title: dirName,
      version: '',
      path: tempPath,
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
    const { path: tempPath } = tempConfig;
    const localTempPath = join(TEMPLATE_CACHE_DIR, name);
    if (isRemotePath(tempPath) && !existsSync(localTempPath)) {
      try {
        await cloneRepoWithOra(tempPath, localTempPath);
      } catch (error) {
        return;
      }
    } else {
      await updateRepoWithOra(localTempPath);
    }
    await fse.remove(this.projectPath);
    await fse.copy(localTempPath, this.projectPath);
    console.log(chalk.green('Template invoked'));
  }
}
