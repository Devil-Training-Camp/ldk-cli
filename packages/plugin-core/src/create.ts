import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';

import { PluginHookTypes } from './constant.js';
import { invokeHook } from './hook.js';
import type { Plugins } from './plugin.js';
import { createPlugins, invokePlugins } from './plugin.js';
import type { TempFiles } from './file.js';
import { createProjectFiles, writeProjectFiles } from './file.js';

export { type PluginFn } from './plugin.js';

export type CoreOptions = {
  tempConfig?: TemplateConfig;
  pluginConfigs: PluginConfig[];
  projectPath: string;
};

export type GlobalOptions = Record<string, unknown> & {
  typescript: boolean;
  vue: boolean;
};
export type CoreContext = {
  files: TempFiles;
  projectPath: string;
  plugins: Plugins;
  options: GlobalOptions;
};

export type PluginCore = {
  context: CoreContext;
  invoke(): Promise<void>;
};

function createCoreContext(context?: Partial<CoreContext>): CoreContext {
  return {
    files: [],
    projectPath: '',
    plugins: [],
    options: {
      typescript: false,
      vue: false,
    },
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
      await invokePlugins(context.plugins);
      await invokeHook(PluginHookTypes.INVOKE_START);
      await invokeHook(PluginHookTypes.INJECT_PROMPT);
      context.files = await createProjectFiles(projectPath, tempConfig?.path, pluginConfigs);
      await invokeHook(PluginHookTypes.TRANSFORM);
      await writeProjectFiles(projectPath, context.files);
      await invokeHook(PluginHookTypes.INVOKE_END);
      // console.log(context);
    },
  };
  return pluginCore;
}
