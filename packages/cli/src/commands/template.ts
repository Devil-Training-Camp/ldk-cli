// import { existsSync } from 'fs';

// import inquirer from 'inquirer';
// import { oraPromise } from 'ora';
// import fse from 'fs-extra';
// import chalk from 'chalk';

import chalk from 'chalk';

import { tempActions } from '..';
import type { TempAction } from '..';
import { TemplateManager } from '../core/template.js';
import { setCacheConfigAsync } from '../common/constant';
// import { transToPromptChoices } from '../common/index.js';

// e.g -t https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git
// e.g -t https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#master
// e.g pnpm dev template ../../lib -f
// e.g test
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
  } else {
    const tempNames = templateManager.templates.map(val => val.name);
    switch (action) {
      case '--add':
        console.error(chalk.bgRed('ERROR') + chalk.red(' Missing template name'));
        break;
      case '--update':
        tempNames.forEach(await templateManager.addTemplate.bind(templateManager));
        break;
      case '--remove':
        await templateManager.removeAllTemplates();
        break;
      case '--show':
        console.log(templateManager.templates);
        return;
      default:
        break;
    }
  }
  await setCacheConfigAsync();
}
