import type { ActionTargetConfig } from '@ldk/shared';
import { Action, getCacheConfig, isDev } from '@ldk/shared';
import chalk from 'chalk';

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
    await this.genPlugins(
      OFFICIAL_PLUGINS.concat(isDev() ? ['virtual-scroll-list-liudingkang'] : []),
    );
  }
  async genPlugins(names: string[]) {
    return Promise.all(names.map(this.genPlugin.bind(this)));
  }
  async genPlugin(nameOrPath: string) {
    const { name, version, local } = await parsePluginPath(nameOrPath);
    if (this.has(name)) return this.get(name) as PluginConfig;
    const pluginConfig = {
      name,
      title: name,
      local,
      version,
    };
    this.add(pluginConfig);
    return pluginConfig;
  }
  async getPlugin(nameOrPath: string) {
    const { name } = await parsePluginPath(nameOrPath);
    const pluginConfig = this.get(name);
    if (pluginConfig === undefined) {
      console.log(chalk.red(`${name} does not exist`));
      return;
    }
    return pluginConfig;
  }
  async addPlugin(name: string) {
    await this.genPlugin(name);
  }
  async removePlugin(nameOrPath: string) {
    const pluginConfig = await this.getPlugin(nameOrPath);
    if (pluginConfig === undefined) return;
    const { name } = pluginConfig;
    this.remove(name);
  }
  async installPlugins() {
    await installPkgsWithOra(this.plugins);
  }
}
