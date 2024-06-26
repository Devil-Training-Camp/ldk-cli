import type { ActionTargetConfig } from '@ldk/shared';
import { Action, getCacheConfig } from '@ldk/shared';

import { OFFICIAL_PLUGINS } from './constant';
import { installPkg } from './package';

export interface PluginConfig extends ActionTargetConfig {}

export class PluginManager extends Action<PluginConfig> {
  plugins: PluginConfig[];
  constructor(public projectPath = 'project') {
    const cacheConfig = getCacheConfig();
    const plugins: PluginConfig[] = cacheConfig.plugins;
    super(plugins);
    this.plugins = plugins;
  }
  async init() {
    await installPkg();
    await this.initPlugins();
    console.log(this.plugins);
  }
  async initPlugins() {
    await this.genPlugins(OFFICIAL_PLUGINS);
  }
  async genPlugins(tempPaths: string[]) {
    return Promise.all(tempPaths.map(this.genPlugin.bind(this)));
  }
  async genPlugin(name: string) {
    if (this.has(name)) return this.get(name) as PluginConfig;
    const pluginConfig = {
      name,
      title: name,
      local: '',
      version: '',
    };
    this.add(pluginConfig);
    return pluginConfig;
  }
}
