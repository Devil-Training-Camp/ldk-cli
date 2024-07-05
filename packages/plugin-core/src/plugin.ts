import type { PluginConfig } from '@ldk/plugin-manager';
import { getModuleEntry, loadModule } from '@ldk/shared';

import { PluginHookTypes } from './constant.js';
import type { PluginHooks } from './hook.js';

export type PluginFn = () => void;
export type Plugin = {
  options: Record<string, unknown>;
  fn: PluginFn;
  name: string;
  [PluginHookTypes.INVOKE_START]: PluginHooks;
  [PluginHookTypes.INVOKE_END]: PluginHooks;
  [PluginHookTypes.INJECT_PROMPT]: PluginHooks;
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
    [PluginHookTypes.INVOKE_START]: [],
    [PluginHookTypes.INVOKE_END]: [],
    [PluginHookTypes.INJECT_PROMPT]: [],
    ...plugin,
  };
}
export async function createPlugins(pluginConfigs: PluginConfig[]): Promise<Plugins> {
  const plugins = await Promise.all(
    pluginConfigs.map(async ({ local, name }) => {
      const moduleEntry = await getModuleEntry(local);
      const plugin = await loadModule<PluginFn>(local, moduleEntry);
      return createPlugin({ fn: plugin, name });
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
