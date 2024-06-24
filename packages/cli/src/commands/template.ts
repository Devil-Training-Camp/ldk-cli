import chalk from 'chalk';
import inquirer from 'inquirer';

import { tempActions } from '..';
import type { TempAction } from '..';
import type { TemplateConfig } from '../core/template.js';
import { TemplateManager } from '../core/template.js';
import { setCacheConfigAsync } from '../common/constant';
import { transToPromptChoices } from '../common/index.js';

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
  action: TempAction,
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
async function withoutNameOrPath(templateManager: TemplateManager, action: TempAction) {
  if (action === '--show') {
    console.log(templateManager.templates);
    return;
  }
  const templates = await templatesPrompt(templateManager.templates);
  switch (action) {
    case '--add':
    case '--update':
      templates.forEach(await templateManager.addTemplate.bind(templateManager));
      break;
    case '--remove':
      if (templates.length === templateManager.templates.length) {
        await templateManager.removeAllTemplates();
        return;
      }
      templates.forEach(await templateManager.removeTemplate.bind(templateManager));
      break;
    default:
      break;
  }
}

// e.g pnpm c:temp
// e.g --add https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#master
export async function template(action: TempAction, nameOrPath?: string) {
  if (!tempActions.includes(action)) {
    console.error(
      chalk.bgRed('ERROR') +
        chalk.red(' Only supports parameters such as --add / --remove / --update / --show'),
    );
    return;
  }
  const templateManager = new TemplateManager();
  console.log(action, nameOrPath);
  await templateManager.init();
  if (nameOrPath) {
    await withNameOrPath(templateManager, action, nameOrPath);
  } else {
    await withoutNameOrPath(templateManager, action);
  }
  await setCacheConfigAsync();
}
