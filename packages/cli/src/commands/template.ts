import chalk from 'chalk';
import inquirer from 'inquirer';
import { TemplateManager } from '@ldk-cli/template-manager';
import type { TemplateConfig } from '@ldk-cli/template-manager';
import { setCacheConfigAsync, transToPromptChoices } from '@ldk-cli/shared';

import { manageActions } from '../index.js';
import type { ManageAction } from '../index.js';

async function templatesPrompt(tempArr: TemplateConfig[]) {
  const { templates }: { templates: string[] } = await inquirer.prompt([
    {
      name: 'templates',
      type: 'checkbox',
      message: `Choice templates`,
      choices: transToPromptChoices(tempArr),
    },
  ]);
  return templates;
}
async function withNameOrPath(
  templateManager: TemplateManager,
  action: ManageAction,
  nameOrPath: string,
) {
  switch (action) {
    case '--add':
    case '--update':
      await templateManager.addTemplate(nameOrPath);
      break;
    case '--remove':
      await templateManager.removeTemplate(nameOrPath);
      break;
    case '--show': {
      const tempConfig = templateManager.getTemplate(nameOrPath);
      if (tempConfig === undefined) return;
      console.log(tempConfig);
      return;
    }
    default:
      break;
  }
}
async function withoutNameOrPath(templateManager: TemplateManager, action: ManageAction) {
  if (action === '--show') {
    console.log(templateManager.templates);
    return;
  }
  const templates = await templatesPrompt(templateManager.templates);
  switch (action) {
    case '--add':
    case '--update':
      await Promise.all(templates.map(templateManager.addTemplate.bind(templateManager)));
      break;
    case '--remove':
      if (templates.length === templateManager.templates.length) {
        await templateManager.removeAllTemplates();
        return;
      }
      await Promise.all(templates.map(templateManager.removeTemplate.bind(templateManager)));
      break;
    default:
      break;
  }
}

// e.g pnpm c:temp
// e.g --add https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#master
export async function template(action: ManageAction, nameOrPath?: string) {
  if (!manageActions.includes(action)) {
    console.error(
      chalk.bgRed('ERROR') +
        chalk.red(' Only supports parameters such as --add / --remove / --update / --show'),
    );
    return;
  }
  const templateManager = new TemplateManager();
  await templateManager.init();
  if (nameOrPath) {
    await withNameOrPath(templateManager, action, nameOrPath);
  } else {
    await withoutNameOrPath(templateManager, action);
  }
  await setCacheConfigAsync();
}
