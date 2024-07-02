import type { PluginConfig } from '@ldk/plugin-manager';
import { getModuleEntry, loadModule } from '@ldk/shared';
import type * as Helper from '@ldk/plugin-helper';

export type PluginContext = {
  code: string;
  helper: typeof Helper;
};
export type Plugin = (context: PluginContext) => void;

export async function collectPlugins(pluginConfigs: PluginConfig[]) {
  const plugins = await Promise.all(
    pluginConfigs.map(async ({ local }) => {
      const moduleEntry = await getModuleEntry(local);
      console.log(moduleEntry);
      const plugin = await loadModule<Plugin>(local, moduleEntry);
      return plugin;
    }),
  );
  return plugins;
}
