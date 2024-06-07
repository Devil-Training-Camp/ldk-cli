import path from 'path';
import fs from 'fs';

import inquirer from 'inquirer';
// import { oraPromise } from 'ora';
// import fse from 'fs-extra/esm';

import type { CreateOptions } from '..';
// import { cloneRepo } from '../common/download.js';

// e.g https://github.com/vuejs/vue-cli.git
export async function create(projectName: string, options: CreateOptions) {
  const cwd = process.cwd();
  const projectPath = path.resolve(cwd, projectName);
  console.log(projectName, options, projectPath);
  if (!options.template) {
    return;
  }
  if (fs.existsSync(projectPath)) {
    const { action }: { action: boolean } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        // 提示信息
        message: `${projectName} is existed, overwrite it?`,
        // 选项
        choices: [
          { name: 'overwrite', value: true },
          { name: 'cancel', value: false },
        ],
      },
    ]);
    console.log(action);
  }
  // try {
  //   await oraPromise(cloneRepo(options.template, cwd));
  //   // await cloneRepo(options.template, cwd);
  //   console.log(`Repository cloned to ${options.template} successfully`);
  // } catch (error) {
  //   console.error('Failed to clone repository:', error);
  // }
}
