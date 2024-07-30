import type { TemplateConfig } from '@ldk-cli/template-manager';
import type { PluginConfig } from '@ldk-cli/plugin-manager';
import { oraPromise } from 'ora';

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
  eslint: boolean;
};
export type CoreContext = {
  files: TempFiles;
  projectPath: string;
  temp?: TemplateConfig;
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
      eslint: false,
    },
    ...context,
  };
}

export let curPluginCoreIns: PluginCore | null = null;

export function setCurPluginCoreIns(ins: PluginCore | null) {
  curPluginCoreIns = ins;
}

export function createPluginCore({ tempConfig, pluginConfigs, projectPath }: CoreOptions) {
  const context = createCoreContext({ projectPath, temp: tempConfig });
  const pluginCore: PluginCore = {
    context,
    async invoke() {
      setCurPluginCoreIns(pluginCore);
      context.plugins = await createPlugins(pluginConfigs);
      await invokePlugins(context.plugins);
      await invokeHook(PluginHookTypes.INVOKE_START);
      await oraPromise(
        async () => {
          await invokeHook(PluginHookTypes.RENDER);
          context.files = await createProjectFiles();
          await invokeHook(PluginHookTypes.TRANSFORM);
          await writeProjectFiles();
        },
        {
          successText: `Project generated successfully`,
          failText: `Project generation failed`,
          text: 'Loading',
        },
      );
      await invokeHook(PluginHookTypes.INVOKE_END);
      // console.dir(context, { depth: 3 });
      setCurPluginCoreIns(null);
    },
  };
  return pluginCore;
}
