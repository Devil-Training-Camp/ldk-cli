import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';

import { PluginHooks } from './constant.js';
import { invokeHook, type PluginHook } from './hook.js';
import { invokePlugins } from './plugin.js';
import type { TempFiles } from './file.js';
import { concatProjectFiles } from './file.js';

export { type Plugin } from './plugin.js';

export type CoreOptions = {
  tempConfig: TemplateConfig;
  pluginConfigs: PluginConfig[];
  projectPath: string;
};

export type CoreContext = {
  files: TempFiles;
  projectPath: string;
  [PluginHooks.INVOKE_START]: PluginHook;
  [PluginHooks.INVOKE_END]: PluginHook;
  [PluginHooks.INJECT_PROMPT]: PluginHook;
};

export type PluginCore = {
  context: CoreContext;
  invoke(): Promise<void>;
};

function createCoreContext(context?: Partial<CoreContext>): CoreContext {
  return {
    files: {},
    projectPath: '',
    [PluginHooks.INVOKE_START]: [],
    [PluginHooks.INVOKE_END]: [],
    [PluginHooks.INJECT_PROMPT]: [],
    ...context,
  };
}

export let curPluginCoreIns: PluginCore | null = null;

export function setCurPluginCoreIns(ins: PluginCore) {
  curPluginCoreIns = ins;
}

export function createPluginCore({ tempConfig, pluginConfigs, projectPath }: CoreOptions) {
  const context = createCoreContext({ projectPath });
  const pluginCore: PluginCore = {
    context,
    async invoke() {
      setCurPluginCoreIns(pluginCore);
      context.files = await concatProjectFiles(projectPath, tempConfig.path, pluginConfigs);
      await invokePlugins(pluginConfigs);
      await invokeHook(PluginHooks.INVOKE_START);
      console.log(context.files);
      await invokeHook(PluginHooks.INJECT_PROMPT);
    },
  };
  return pluginCore;
}
