import chalk from 'chalk';
import type * as Helper from '@ldk/plugin-helper';
import * as helper from '@ldk/plugin-helper';

import { PluginHookTypes } from './constant.js';
import { curPluginCoreIns } from './create.js';
import { curPlugin } from './plugin.js';

export type HookContext = {
  code: string;
  helper: typeof Helper;
  path: string;
  projectPath: string;
  options: Record<string, unknown>;
  [key: string]: unknown;
};
type PluginHook = {
  pluginName: string;
} & ((context: HookContext) => unknown);
export type PluginHooks = PluginHook[];

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

function createHook(type: PluginHookTypes) {
  return (cb: PluginHook) => {
    if (curPlugin) {
      cb.pluginName = curPlugin.name;
      curPlugin[type].push(cb);
    }
  };
}

export const onInvokeStart = createHook(PluginHookTypes.INVOKE_START);
export const onInvokeEnd = createHook(PluginHookTypes.INVOKE_END);
export const onInjectPrompt = createHook(PluginHookTypes.INJECT_PROMPT);

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
        return;
      }
      for (const [path, file] of Object.entries(files)) {
        hookContext.code = file;
        hookContext.path = path;
        for (const hook of hooks) {
          console.log(hook.toString());
          await hook(hookContext);
        }
        files[path] = hookContext.code;
      }
    }
  } catch (error) {
    console.log(chalk.bgRed('ERROR') + chalk.red(` ${type}`), error);
  }
}
