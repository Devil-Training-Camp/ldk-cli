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
};

export type PluginCore = {
  context: CoreContext;
  invoke(): Promise<void>;
};

function createCoreContext(): CoreContext {
  return {
    files: {},
    projectPath: '',
    [PluginHooks.INVOKE_START]: [],
    [PluginHooks.INVOKE_END]: [],
  };
}

export let curPluginCoreIns: PluginCore | null = null;

export function setCurPluginCoreIns(ins: PluginCore) {
  curPluginCoreIns = ins;
}

export function createPluginCore({ tempConfig, pluginConfigs, projectPath }: CoreOptions) {
  const context = createCoreContext();
  context.projectPath = projectPath;
  const pluginCore: PluginCore = {
    context,
    async invoke() {
      setCurPluginCoreIns(pluginCore);
      context.files = await concatProjectFiles(projectPath, tempConfig.path, pluginConfigs);
      await invokePlugins(pluginConfigs);
      await invokeHook(PluginHooks.INVOKE_START);
    },
  };
  return pluginCore;
}
