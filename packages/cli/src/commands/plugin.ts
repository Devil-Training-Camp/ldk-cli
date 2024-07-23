import chalk from 'chalk';
import inquirer from 'inquirer';
import { PluginManager } from '@ldk-cli/plugin-manager';
import type { PluginConfig } from '@ldk-cli/plugin-manager';
import { setCacheConfigAsync, transToPromptChoices } from '@ldk-cli/shared';

import { manageActions } from '../index.js';
import type { ManageAction } from '../index.js';

async function pluginsPrompt(tempArr: PluginConfig[]) {
  const { plugins }: { plugins: string[] } = await inquirer.prompt([
    {
      name: 'plugins',
      type: 'checkbox',
      message: `Choice plugins`,
      choices: transToPromptChoices(tempArr),
    },
  ]);
  return plugins;
}
async function withNameOrPath(
  pluginManager: PluginManager,
  action: ManageAction,
  nameOrPath: string,
) {
  switch (action) {
    case '--add':
    case '--update':
      await pluginManager.addPlugin(nameOrPath);
      break;
    case '--remove':
      await pluginManager.removePlugin(nameOrPath);
      break;
    case '--show': {
      const tempConfig = pluginManager.getPlugin(nameOrPath);
      if (tempConfig === undefined) return;
      console.log(tempConfig);
      return;
    }
    default:
      break;
  }
  await pluginManager.installPlugins();
}
async function withoutNameOrPath(pluginManager: PluginManager, action: ManageAction) {
  if (action === '--show') {
    console.log(pluginManager.plugins);
    return;
  }
  const plugins = await pluginsPrompt(pluginManager.plugins);
  switch (action) {
    case '--add':
    case '--update':
      await Promise.all(plugins.map(pluginManager.addPlugin.bind(pluginManager)));
      break;
    case '--remove':
      await Promise.all(plugins.map(pluginManager.removePlugin.bind(pluginManager)));
      break;
    default:
      break;
  }
  await pluginManager.installPlugins();
}

// e.g pnpm c:plugin
// e.g --add @ldk-cli/cli-plugin-eslint
export async function plugin(action: ManageAction, nameOrPath?: string) {
  if (!manageActions.includes(action)) {
    console.error(
      chalk.bgRed('ERROR') +
        chalk.red(' Only supports parameters such as --add / --remove / --update / --show'),
    );
    return;
  }
  const pluginManager = new PluginManager();
  await pluginManager.init();
  if (nameOrPath) {
    await withNameOrPath(pluginManager, action, nameOrPath);
  } else {
    await withoutNameOrPath(pluginManager, action);
  }
  await setCacheConfigAsync();
}
