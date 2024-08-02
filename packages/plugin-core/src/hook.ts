import chalk from 'chalk';
import type * as Helper from '@ldk-cli/plugin-helper';
import * as helper from '@ldk-cli/plugin-helper';
import inquirer from 'inquirer';

import { PluginHookTypes } from './constant.js';
import type { GlobalOptions } from './create.js';
import { curPluginCoreIns } from './create.js';
import { getCurPlugin, setCurPlugin } from './plugin.js';
import type { TempFile } from './file.js';
import { render } from './file.js';

type BaseHookContext = {
  helper: typeof Helper;
  projectPath: string;
  options: Record<string, unknown>;
  [key: string]: unknown;
};
type ExtraHookContext<T> = T extends PluginHookTypes.TRANSFORM
  ? { file: TempFile }
  : T extends PluginHookTypes.RENDER
    ? { render: typeof render }
    : { inquirer: typeof inquirer };

export type HookContext<T = PluginHookTypes.TRANSFORM> = BaseHookContext & ExtraHookContext<T>;

type PluginHook<T> = (context: HookContext<T>) => unknown;

export type PluginHooks<T> = PluginHook<T>[];

function createHookContext(context?: Partial<HookContext>) {
  return {
    file: null as unknown as TempFile,
    helper,
    render: null as unknown as typeof render,
    inquirer: null as unknown as typeof inquirer,
    projectPath: '',
    options: {
      global: {} as GlobalOptions,
      plugin: {},
    },
    ...context,
  };
}
function createHook<T extends PluginHookTypes>(type: T) {
  return (cb: PluginHook<T>) => {
    const curPlugin = getCurPlugin();
    if (curPlugin) {
      const hook = cb as PluginHook<PluginHookTypes>;
      curPlugin[type].push(hook);
    }
  };
}

export const onInvokeStart = createHook(PluginHookTypes.INVOKE_START);
export const onInvokeEnd = createHook(PluginHookTypes.INVOKE_END);
export const onTransform = createHook(PluginHookTypes.TRANSFORM);
export const onRender = createHook(PluginHookTypes.RENDER);

export async function invokeHook(type: PluginHookTypes) {
  if (curPluginCoreIns === null) return;
  try {
    const context = curPluginCoreIns.context;
    const { files, projectPath, plugins } = context;
    const hookContext = createHookContext({ projectPath });

    for (const plugin of plugins) {
      const hooks = plugin[type];
      setCurPlugin(plugin);
      hookContext.options = plugin.options;
      if (type === PluginHookTypes.TRANSFORM) {
        for (const file of files) {
          hookContext.file = file;
          for (const hook of hooks) {
            await hook(hookContext);
          }
        }
        setCurPlugin(null);
        continue;
      }
      if (type === PluginHookTypes.RENDER) {
        hookContext.render = render;
      } else {
        hookContext.inquirer = inquirer;
      }
      for (const hook of hooks) {
        await hook(hookContext);
      }
      setCurPlugin(null);
    }
  } catch (error) {
    console.log(chalk.bgRed('ERROR') + chalk.red(` ${type}`), error);
  }
}
