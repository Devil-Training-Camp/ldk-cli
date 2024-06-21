// import { existsSync } from 'fs';

// import inquirer from 'inquirer';
// import { oraPromise } from 'ora';
// import fse from 'fs-extra';
// import chalk from 'chalk';

import chalk from 'chalk';

import { tempActions } from '..';
import type { TempAction } from '..';
import { TemplateManager } from '../core/template.js';
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
      case '--update' || '--add':
        await templateManager.addTemplate(nameOrPath);
        break;
      case '--remove':
        await templateManager.addTemplate(nameOrPath);
        break;
      default:
        break;
    }
  }
  // if (add) {
  // }
  // if (remove !== undefined) {
  // }
}
