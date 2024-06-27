import type { ActionTargetConfig } from '@ldk/shared';
import { Action, getCacheConfig } from '@ldk/shared';

import { OFFICIAL_PLUGINS } from './constant.js';
import { installPkgs } from './package.js';

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
    await this.initPlugins();
    console.log(this.plugins);
    await installPkgs(this.plugins);
  }
  async initPlugins() {
    await this.genPlugins(OFFICIAL_PLUGINS);
  }
  async genPlugins(names: string[]) {
    return Promise.all(names.map(this.genPlugin.bind(this)));
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
  // async installPlugins() {
  //   const configs = await this.genPlugins();
  // }
}
