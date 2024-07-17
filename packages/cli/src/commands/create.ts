import path from 'path';
import { existsSync } from 'fs';

import inquirer from 'inquirer';
import { CWD, transToPromptChoices } from '@ldk/shared';
import type { TemplateConfig } from '@ldk/template-manager';
import { TemplateManager } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import { PluginManager, BUILD_IN_PLUGINS, isBuildInPlugin } from '@ldk/plugin-manager';
import { createPluginCore } from '@ldk/plugin-core';

import type { CreateOptions } from '../index.js';

export async function templatePrompt(temps: TemplateConfig[]) {
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
  allPlugins = allPlugins.filter(plugin => !isBuildInPlugin(plugin.name));
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

  // const template = await templatePrompt(templateManager.templates);
  const template = '';
  // await templateManager.invokeTemplate(template);
  const pluginManager = new PluginManager();
  await pluginManager.init();
  // const promptPlugins = await pluginPrompt(pluginManager.plugins);
  const promptPlugins = [
    '@ldk/cli-plugin-eslint',
    '@ldk/cli-plugin-prettier',
    '@ldk/cli-plugin-vue',
    '@ldk/cli-plugin-router',
  ];
  const plugins = [...BUILD_IN_PLUGINS, ...promptPlugins];
  plugins.forEach(await pluginManager.addPlugin.bind(pluginManager));
  await pluginManager.installPlugins();

  const pluginConfigs = plugins.map(pluginManager.get.bind(pluginManager)) as PluginConfig[];
  const tempConfig = templateManager.getTemplate(template);
  await createPluginCore({ tempConfig, pluginConfigs, projectPath }).invoke();
}
