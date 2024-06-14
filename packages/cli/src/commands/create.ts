import path from 'path';
import fs from 'fs';

import inquirer from 'inquirer';
// import { oraPromise } from 'ora';
// import fse from 'fs-extra';
// import chalk from 'chalk';

import type { CreateOptions } from '..';
import { CWD } from '../common/constant.js';
import { TemplateManager } from '../core/template.js';
import { transToPromptChoices } from '../common/index.js';

// e.g -t https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git
// e.g pnpm dev create ../../lib -f
// e.g test
export async function create(projectName: string, options: CreateOptions) {
  const projectPath = path.resolve(CWD, projectName);
  console.log(projectName, options, projectPath);
  if (!options.force && fs.existsSync(projectPath)) {
    const { action }: { action: boolean } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `${projectName} is existed, overwrite it?`,
        choices: [
          { name: 'overwrite', value: true },
          { name: 'cancel', value: false },
        ],
      },
    ]);
    if (!action) return;
  }
  const templateManager = new TemplateManager(projectPath);
  if (options.template) {
    await templateManager.invokeTemplate(options.template);
    return;
  }
  await templateManager.init();
  const { template }: { template: string } = await inquirer.prompt([
    {
      name: 'template',
      type: 'list',
      message: `Choice template`,
      choices: [
        ...transToPromptChoices(templateManager.templates),
        {
          name: 'Custom',
          value: '',
        },
      ],
    },
  ]);
  console.log(template);
  if (template) {
    await templateManager.invokeTemplate(template);
  }
}
