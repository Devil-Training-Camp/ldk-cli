// import { pathToFileURL } from 'url';

// import type { PluginConfig } from '@ldk/plugin-manager';

// import type { FileContext } from './index.js';

// export type Plugin = (context: FileContext) => unknown;
// export async function collectPlugins(pluginConfigs: PluginConfig[]) {
//   const plugins = await Promise.all(
//     pluginConfigs.map(async ({ local }) => {
//       const plugin: Plugin = await import(pathToFileURL(local).toString());
//       return plugin;
//     }),
//   );
//   return plugins;
// }
