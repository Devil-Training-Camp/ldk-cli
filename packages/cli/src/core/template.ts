import { join } from 'path';
import { existsSync } from 'fs';

import fse from 'fs-extra';
import { oraPromise } from 'ora';
import { glob } from 'glob';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';

import type { ActionTargetConfig } from '../common/action.js';
import { Action } from '../common/action.js';
import { OFFICIAL_TEMPLATES, TEMPLATE_CACHE_DIR } from '../common/constant.js';
import { cloneRepo, getRepoDirName } from '../common/download.js';
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
    // console.log(this.templates);
  }
  async initTemplates() {
    if (existsSync(TEMPLATE_CACHE_DIR)) {
      const tempPaths = await glob(`${TEMPLATE_CACHE_DIR}/*/`);
      this.genTemplates(tempPaths);
    }
    this.genTemplates(OFFICIAL_TEMPLATES);
  }
  genTemplates(tempPaths: string[]) {
    return tempPaths.map(this.genTemplate.bind(this));
  }
  genTemplate(tempPath: string) {
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
      this.genTemplate(nameOrPath);
      name = getRepoDirName(nameOrPath);
    }
    const tempConfig = this.get(name);
    if (typeof tempConfig === 'undefined') return;
    const { path: tempPath } = tempConfig;
    const localTempPath = join(TEMPLATE_CACHE_DIR, name);
    if (isRemotePath(tempPath) && !existsSync(localTempPath)) {
      try {
        await oraPromise(cloneRepo(tempPath, localTempPath), {
          successText: `Repository cloned successfully`,
          failText: `Failed to clone repository`,
          text: 'Loading clone',
        });
      } catch (error) {
        console.error(chalk.bgRed('ERROR') + chalk.red(' Failed to clone repository:'), error);
        return;
      }
    }
    await fse.remove(this.projectPath);
    await fse.copy(localTempPath, this.projectPath);
    console.log(chalk.green('Template invoked'));
  }
  // async initTemplates() {
  //   if (!existsSync(TEMPLATE_CACHE_DIR)) {
  //     await oraPromise(
  //       Promise.all(
  //         OFFICIAL_TEMPLATES.map(async tempUrl => {
  //           const tempDirName = getRepoDirName(tempUrl);
  //           const tempPath = join(TEMPLATE_CACHE_DIR, tempDirName);
  //           await cloneRepo(tempUrl, tempPath);
  //         }),
  //       ),
  //       {
  //         successText: `Successfully downloaded repository`,
  //         failText: `Failed to download Templates`,
  //         text: 'Loading download Templates',
  //       },
  //     );
  //   }
  //   await this.genTemplates();
  // }
  // async genTemplates() {
  //   const tempPaths = await glob(`${TEMPLATE_CACHE_DIR}/*/`);
  //   await Promise.all(
  //     tempPaths.map(async tempPath => {
  //       const dirName = basename(tempPath);
  //       const latestCommitId = await this.getLatestCommitId(tempPath);
  //       this.templates.push({
  //         name: tempPath,
  //         title: dirName,
  //         version: latestCommitId,
  //         path: '',
  //       });
  //     }),
  //   );
  // }
  async getLatestCommitId(tempPath: string) {
    const git = simpleGit(tempPath);
    try {
      const log = await git.log();
      const latestCommit = log.latest?.hash || '';
      return latestCommit;
    } catch (err) {
      console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to get repository version: '), err);
    }
    return '';
  }
  async checkVersion() {}
}
