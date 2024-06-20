import path from 'path';
import { existsSync } from 'fs';

import inquirer from 'inquirer';
// import { oraPromise } from 'ora';
// import fse from 'fs-extra';
// import chalk from 'chalk';

import type { CreateOptions } from '..';
import { CWD } from '../common/constant.js';
import { TemplateManager } from '../core/template.js';
import { transToPromptChoices } from '../common/index.js';

// e.g -t https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git
// e.g -t https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#master
// e.g pnpm dev template ../../lib -f
// e.g test
export async function template(projectName: string, options: CreateOptions) {
  const projectPath = path.resolve(CWD, projectName);
  console.log(projectName, options, projectPath);

  if (!options.force && existsSync(projectPath)) {
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
  await templateManager.init();
  if (options.template) {
    await templateManager.invokeTemplate(options.template);
    return;
  }
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
  if (template) {
    await templateManager.invokeTemplate(template);
  }
}
