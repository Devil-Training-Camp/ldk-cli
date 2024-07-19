import type { PluginConfig } from '@ldk/plugin-manager';
import { getModuleEntry, loadModule } from '@ldk/shared';

import { PluginHookTypes } from './constant.js';
import type { PluginHooks } from './hook.js';

export type PluginFn = () => void;
export type RenderPath = {
  from: string;
  to: string;
};
export type Plugin = {
  options: Record<string, unknown>;
  fn: PluginFn;
  name: string;
  paths: RenderPath[];
  config: PluginConfig;
  [PluginHookTypes.INVOKE_START]: PluginHooks<PluginHookTypes.INVOKE_START>;
  [PluginHookTypes.RENDER]: PluginHooks<PluginHookTypes.RENDER>;
  [PluginHookTypes.TRANSFORM]: PluginHooks<PluginHookTypes.TRANSFORM>;
  [PluginHookTypes.INVOKE_END]: PluginHooks<PluginHookTypes.INVOKE_END>;
};
export type Plugins = Plugin[];

export let curPlugin: Plugin | null = null;

export function setCurPlugin(pluginInfo: Plugin | null) {
  curPlugin = pluginInfo;
}
function createPlugin(plugin?: Partial<Plugin>): Plugin {
  return {
    options: {},
    fn: () => {},
    name: '',
    paths: [],
    config: {} as PluginConfig,
    [PluginHookTypes.INVOKE_START]: [],
    [PluginHookTypes.RENDER]: [],
    [PluginHookTypes.TRANSFORM]: [],
    [PluginHookTypes.INVOKE_END]: [],
    ...plugin,
  };
}
export async function createPlugins(pluginConfigs: PluginConfig[]): Promise<Plugins> {
  const plugins = await Promise.all(
    pluginConfigs.map(async config => {
      const { local, name } = config;
      const moduleEntry = await getModuleEntry(local);
      const plugin = await loadModule<PluginFn>(local, moduleEntry);
      return createPlugin({ fn: plugin, name, config });
    }),
  );
  return plugins;
}
export async function invokePlugins(pluginInfos: Plugins) {
  for (const pluginInfo of pluginInfos) {
    const { fn } = pluginInfo;
    setCurPlugin(pluginInfo);
    await fn();
    setCurPlugin(null);
  }
}
