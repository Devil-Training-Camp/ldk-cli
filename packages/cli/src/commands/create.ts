import path from 'path';
import { existsSync } from 'fs';

import inquirer from 'inquirer';
import type { PkgManager } from '@ldk-cli/shared';
import { CWD, getLocalConfig, setLocalConfigAsync, transToPromptChoices } from '@ldk-cli/shared';
import type { TemplateConfig } from '@ldk-cli/template-manager';
import { TemplateManager } from '@ldk-cli/template-manager';
import type { PluginConfig } from '@ldk-cli/plugin-manager';
import { PluginManager, BUILD_IN_PLUGINS, isBuildInPlugin } from '@ldk-cli/plugin-manager';
import { createPluginCore } from '@ldk-cli/plugin-core';

import type { CreateOptions } from '../index.js';
import { getLocalManagers } from '../manager.js';

export async function templatePrompt(temps: TemplateConfig[]) {
  const { template }: { template: string } = await inquirer.prompt([
    {
      name: 'template',
      type: 'list',
      message: `Choice template`,
      choices: [{ name: 'default', value: '' }, ...transToPromptChoices(temps)],
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
export async function pkgManagerPrompt() {
  const localManagers = await getLocalManagers();
  if (localManagers.length == 1) {
    return localManagers[0];
  }
  const { pkgManager }: { pkgManager: PkgManager } = await inquirer.prompt([
    {
      name: 'pkgManager',
      type: 'list',
      message: `Choose package manager?`,
      choices: localManagers.map(manager => ({ name: manager, value: manager })),
    },
  ]);
  return pkgManager;
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
  // const template = '';
  const pluginManager = new PluginManager();
  await pluginManager.init();
  const promptPlugins = await pluginPrompt(pluginManager.plugins);
  // const promptPlugins = [
  //   '@ldk-cli/cli-plugin-eslint',
  //   '@ldk-cli/cli-plugin-prettier',
  //   '@ldk-cli/cli-plugin-vue',
  //   '@ldk-cli/cli-plugin-router',
  // ];
  const plugins = [...BUILD_IN_PLUGINS, ...promptPlugins];
  await Promise.all(plugins.map(pluginManager.addPlugin.bind(pluginManager)));
  const localConfig = getLocalConfig();
  if (!localConfig.pkgManager) {
    const pkgManager = await pkgManagerPrompt();
    localConfig.pkgManager = pkgManager;
  }
  await pluginManager.installPlugins();

  console.log(pluginManager.plugins);

  const pluginConfigs = plugins.map(pluginManager.get.bind(pluginManager)) as PluginConfig[];
  const tempConfig = templateManager.getTemplate(template);
  await createPluginCore({ tempConfig, pluginConfigs, projectPath }).invoke();

  await setLocalConfigAsync();
}
