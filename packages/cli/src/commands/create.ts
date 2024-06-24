import path from 'path';
import { existsSync } from 'fs';

import inquirer from 'inquirer';

import type { CreateOptions } from '..';
import { CWD } from '../common/constant.js';
import type { TemplateConfig } from '../core/template.js';
import { TemplateManager } from '../core/template.js';
import { transToPromptChoices } from '../common/index.js';

async function templatePrompt(tempArr: TemplateConfig[]) {
  const { template }: { template: string } = await inquirer.prompt([
    {
      name: 'template',
      type: 'list',
      message: `Choice template`,
      choices: transToPromptChoices(tempArr),
    },
  ]);
  return template;
}

async function actionPrompt(projectName: string) {
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
  return action;
}

// e.g pnpm c:create
// e.g -t https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git
// e.g -t https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#master
export async function create(projectName: string, options: CreateOptions) {
  const projectPath = path.resolve(CWD, projectName);

  if (!options.force && existsSync(projectPath)) {
    const action = await actionPrompt(projectName);
    if (!action) return;
  }

  const templateManager = new TemplateManager(projectPath);
  await templateManager.init();

  if (options.template) {
    await templateManager.invokeTemplate(options.template);
    return;
  }

  const template = await templatePrompt(templateManager.templates);
  await templateManager.invokeTemplate(template);
}
