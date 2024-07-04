import chalk from 'chalk';
import type * as Helper from '@ldk/plugin-helper';
import * as helper from '@ldk/plugin-helper';

import { PluginHooks } from './constant.js';
import { curPluginCoreIns } from './create.js';

export type HookContext = {
  code: string;
  helper: typeof Helper;
  path: string;
  projectPath: string;
};

export type PluginHook<TFn = Function> = TFn[];

function createHookContext(context?: Partial<HookContext>): HookContext {
  return {
    code: '',
    helper,
    path: '',
    projectPath: '',
    ...context,
  };
}

function createHook(type: PluginHooks) {
  return (cb: (context: HookContext) => unknown) => {
    if (curPluginCoreIns) {
      curPluginCoreIns.context[type].push(cb);
    }
  };
}

export const onInvokeStart = createHook(PluginHooks.INVOKE_START);
export const onInvokeEnd = createHook(PluginHooks.INVOKE_END);

export async function invokeHook(type: PluginHooks) {
  if (curPluginCoreIns === null) return;
  try {
    const context = curPluginCoreIns.context;
    const { files, projectPath } = context;
    const hookContext = createHookContext({ projectPath });
    for (const [path, file] of Object.entries(files)) {
      hookContext.code = file;
      hookContext.path = path;
      const hooks = context[type];
      for (const hook of hooks) {
        await hook(hookContext);
      }
    }
  } catch (error) {
    console.error(chalk.bgRed('ERROR') + chalk.red(` ${type}`), error);
  }
}
