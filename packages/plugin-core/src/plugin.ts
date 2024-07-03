import type { PluginConfig } from '@ldk/plugin-manager';
import { getModuleEntry, loadModule } from '@ldk/shared';

export type Plugin = () => void;

async function collectPlugins(pluginConfigs: PluginConfig[]) {
  const plugins = await Promise.all(
    pluginConfigs.map(async ({ local }) => {
      const moduleEntry = await getModuleEntry(local);
      const plugin = await loadModule<Plugin>(local, moduleEntry);
      return plugin;
    }),
  );
  return plugins;
}
export async function invokePlugins(pluginConfigs: PluginConfig[]) {
  const plugins = await collectPlugins(pluginConfigs);
  for (const plugin of plugins) {
    await plugin();
  }
}
