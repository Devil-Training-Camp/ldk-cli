import type { ActionTargetConfig } from '@ldk/shared';
import { Action, getCacheConfig } from '@ldk/shared';

import { OFFICIAL_PLUGINS } from './constant';

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
    // console.log(this.plugins);
  }
  async initPlugins() {
    await this.genPlugins(OFFICIAL_PLUGINS);
  }
  async genPlugins(tempPaths: string[]) {
    return Promise.all(tempPaths.map(this.genPlugin.bind(this)));
  }
  async genPlugin() {}
}
