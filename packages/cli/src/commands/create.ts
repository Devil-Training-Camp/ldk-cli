import path from 'path';
import { existsSync } from 'fs';

import inquirer from 'inquirer';
import { CWD, transToPromptChoices } from '@ldk/shared';
import { TemplateManager } from '@ldk/template-manager';
import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import { PluginManager } from '@ldk/plugin-manager';

import type { CreateOptions } from '../index.js';

async function templatePrompt(temps: TemplateConfig[]) {
  const { template }: { template: string } = await inquirer.prompt([
    {
      name: 'template',
      type: 'list',
      message: `Choice template`,
      choices: transToPromptChoices(temps),
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
export async function pluginPrompt(allPlugins: PluginConfig[]) {
  const { plugins }: { plugins: string[] } = await inquirer.prompt([
    {
      name: 'plugins',
      type: 'checkbox',
      message: `Choice plugins`,
      choices: transToPromptChoices(allPlugins),
    },
  ]);
  return plugins;
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
  const pluginManager = new PluginManager();
  await pluginManager.init();
  const plugins = await pluginPrompt(pluginManager.plugins);
  console.log(plugins);
  plugins.forEach(await pluginManager.addPlugin.bind(pluginManager));
  await pluginManager.installPlugins();
}
