import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import * as Helper from '@ldk/plugin-helper';

import { collectPlugins } from './plugin.js';

export { type Plugin } from './plugin.js';

export type CoreOptions = {
  tempConfig: TemplateConfig;
  pluginConfigs: PluginConfig[];
  projectPath: string;
};

function createPluginContext() {
  return {
    code: '',
    helper: Helper,
    path: '',
  };
}
function createCoreContext() {
  return {
    core: null,
    files: [],
    invokeStarts: [],
    invokeEnds: [],
  };
}

export function createPluginCore({ tempConfig, pluginConfigs, projectPath }: CoreOptions) {
  console.log(tempConfig, pluginConfigs, projectPath);
  const context = createCoreContext();
  const pluginCore = {
    context,
    async invoke() {
      const pluginContext = createPluginContext();
      const plugins = await collectPlugins(pluginConfigs);
      plugins.forEach(plugin => plugin(pluginContext));
    },
  };
  return pluginCore;
}
