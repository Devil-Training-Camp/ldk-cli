import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';

import { PluginHookTypes } from './constant.js';
import { invokeHook } from './hook.js';
import type { Plugins } from './plugin.js';
import { createPlugins, invokePlugins } from './plugin.js';
import type { TempFiles } from './file.js';
import { createProjectFiles } from './file.js';

export { type PluginFn } from './plugin.js';

export type CoreOptions = {
  tempConfig: TemplateConfig;
  pluginConfigs: PluginConfig[];
  projectPath: string;
};

export type CoreContext = {
  files: TempFiles;
  projectPath: string;
  plugins: Plugins;
};

export type PluginCore = {
  context: CoreContext;
  invoke(): Promise<void>;
};

function createCoreContext(context?: Partial<CoreContext>): CoreContext {
  return {
    files: {},
    projectPath: '',
    plugins: [],
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
      context.plugins = await createPlugins(pluginConfigs);
      // await invokeHook(PluginHookTypes.INVOKE_START);
      await invokePlugins(context.plugins);
      await invokeHook(PluginHookTypes.INJECT_PROMPT);
      context.files = await createProjectFiles(projectPath, tempConfig.path, pluginConfigs);
      console.log(context);
      // await invokeHook(PluginHookTypes.INVOKE_END);
    },
  };
  return pluginCore;
}
