import chalk from 'chalk';
import type * as Helper from '@ldk/plugin-helper';
import * as helper from '@ldk/plugin-helper';

import { PluginHookTypes } from './constant.js';
import { curPluginCoreIns } from './create.js';
import { curPlugin } from './plugin.js';

type BaseHookContext = {
  helper: typeof Helper;
  projectPath: string;
  options: Record<string, unknown>;
  [key: string]: unknown;
};
type ExtraHookContext<T> = T extends PluginHookTypes.INVOKE_START | PluginHookTypes.INVOKE_END
  ? {}
  : { code: string; path: string };

export type HookContext<T = PluginHookTypes.TRANSFORM> = BaseHookContext & ExtraHookContext<T>;

type PluginHookFn<T> = (context: HookContext<T>) => unknown;
type PluginHook<T> = {
  pluginName: string;
} & PluginHookFn<T>;

export type PluginHooks<T> = PluginHook<T>[];

function createHookContext(context?: Partial<HookContext>): HookContext {
  return {
    code: '',
    helper,
    path: '',
    projectPath: '',
    options: {},
    ...context,
  };
}
function createHook<T>(type: PluginHookTypes) {
  return (cb: PluginHookFn<T>) => {
    if (curPlugin) {
      const hook = cb as PluginHook<typeof type>;
      hook.pluginName = curPlugin.name;
      curPlugin[type].push(hook);
    }
  };
}

export const onInvokeStart = createHook(PluginHookTypes.INVOKE_START);
export const onInvokeEnd = createHook(PluginHookTypes.INVOKE_END);
export const onInjectPrompt = createHook<PluginHookTypes.INJECT_PROMPT>(
  PluginHookTypes.INJECT_PROMPT,
);
export const onTransform = createHook(PluginHookTypes.TRANSFORM);

export async function invokeHook(type: PluginHookTypes) {
  if (curPluginCoreIns === null) return;
  try {
    const context = curPluginCoreIns.context;
    const { files, projectPath, plugins } = context;
    const hookContext = createHookContext({ projectPath });
    const fileEntries = Object.entries(files);

    for (const plugin of plugins) {
      const hooks = plugin[type];
      hookContext.options = plugin.options;
      if (fileEntries.length === 0) {
        for (const hook of hooks) {
          await hook(hookContext);
        }
        continue;
      }
      for (const [path, file] of Object.entries(files)) {
        hookContext.code = file;
        hookContext.path = path;
        for (const hook of hooks) {
          await hook(hookContext);
        }
        files[path] = hookContext.code;
      }
    }
  } catch (error) {
    console.log(chalk.bgRed('ERROR') + chalk.red(` ${type}`), error);
  }
}
