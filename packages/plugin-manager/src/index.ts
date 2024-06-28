import type { ActionTargetConfig } from '@ldk/shared';
import { Action, getCacheConfig, setCacheConfigAsync } from '@ldk/shared';

import { OFFICIAL_PLUGINS } from './constant.js';
import { installPkgsWithOra, parsePluginPath } from './package.js';

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
  }
  async initPlugins() {
    await this.genPlugins(OFFICIAL_PLUGINS);
  }
  async genPlugins(names: string[]) {
    return Promise.all(names.map(this.genPlugin.bind(this)));
  }
  async genPlugin(nameOrPath: string) {
    const { name, version } = await parsePluginPath(nameOrPath);
    if (this.has(name)) return this.get(name) as PluginConfig;
    const pluginConfig = {
      name,
      title: name,
      local: '',
      version,
    };
    this.add(pluginConfig);
    return pluginConfig;
  }
  async addPlugins(names: string[]) {
    await this.genPlugins(names);
  }
  async installPlugins() {
    await installPkgsWithOra(this.plugins);
    await setCacheConfigAsync();
  }
}
