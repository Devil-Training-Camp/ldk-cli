import chalk from 'chalk';
import type * as Helper from '@ldk/plugin-helper';
import * as helper from '@ldk/plugin-helper';

import { PluginHookTypes } from './constant.js';
import type { GlobalOptions } from './create.js';
import { curPluginCoreIns } from './create.js';
import { curPlugin } from './plugin.js';
import type { TempFile } from './file.js';

type BaseHookContext = {
  helper: typeof Helper;
  projectPath: string;
  options: {
    global: GlobalOptions;
    plugin: Record<string, unknown>;
  };
  [key: string]: unknown;
};
type ExtraHookContext<T> = T extends PluginHookTypes.TRANSFORM ? { file: TempFile } : {};

export type HookContext<T = PluginHookTypes.TRANSFORM> = BaseHookContext & ExtraHookContext<T>;

type PluginHookFn<T> = (context: HookContext<T>) => unknown;
type PluginHook<T> = {
  pluginName: string;
} & PluginHookFn<T>;

export type PluginHooks<T> = PluginHook<T>[];

function createHookContext(context?: Partial<HookContext>): HookContext {
  return {
    file: {} as TempFile,
    helper,
    projectPath: '',
    options: {
      global: {} as GlobalOptions,
      plugin: {},
    },
    ...context,
  };
}
function createHook<T extends PluginHookTypes>(type: T) {
  return (cb: PluginHookFn<T>) => {
    if (curPlugin) {
      const hook = cb as PluginHook<PluginHookTypes>;
      hook.pluginName = curPlugin.name;
      curPlugin[type].push(hook);
    }
  };
}

export const onInvokeStart = createHook(PluginHookTypes.INVOKE_START);
export const onInvokeEnd = createHook(PluginHookTypes.INVOKE_END);
export const onInjectPrompt = createHook(PluginHookTypes.INJECT_PROMPT);
export const onTransform = createHook(PluginHookTypes.TRANSFORM);

export async function invokeHook(type: PluginHookTypes) {
  if (curPluginCoreIns === null) return;
  try {
    const context = curPluginCoreIns.context;
    const { files, projectPath, plugins, options } = context;
    const hookContext = createHookContext({ projectPath });
    hookContext.options.global = options;

    for (const plugin of plugins) {
      const hooks = plugin[type];
      hookContext.options.plugin = plugin.options;
      if (type !== PluginHookTypes.TRANSFORM) {
        for (const hook of hooks) {
          await hook(hookContext);
        }
        continue;
      }
      for (const file of files) {
        hookContext.file = file;
        for (const hook of hooks) {
          await hook(hookContext);
        }
      }
    }
  } catch (error) {
    console.log(chalk.bgRed('ERROR') + chalk.red(` ${type}`), error);
  }
}
