import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import * as Helper from '@ldk/plugin-helper';

import type { PluginContext } from './plugin.js';
import { collectPlugins } from './plugin.js';
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
  invokeStarts: string[];
  invokeEnds: string[];
};

export type PluginCore = {
  context: CoreContext;
  invoke(): Promise<void>;
};

function createCoreContext(): CoreContext {
  return {
    files: {},
    invokeStarts: [],
    invokeEnds: [],
  };
}
function createPluginContext(): PluginContext {
  return {
    code: '',
    helper: Helper,
    path: '',
  };
}

export function createPluginCore({ tempConfig, pluginConfigs, projectPath }: CoreOptions) {
  const context = createCoreContext();
  const pluginCore: PluginCore = {
    context,
    async invoke() {
      context.files = await concatProjectFiles(projectPath, tempConfig.path, pluginConfigs);
      console.log(context.files);
      const pluginContext = createPluginContext();
      const plugins = await collectPlugins(pluginConfigs);
      plugins.forEach(plugin => plugin(pluginContext));
    },
  };
  return pluginCore;
}
