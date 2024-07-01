import type { TemplateConfig } from '@ldk/template-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import type * as Helper from '@ldk/plugin-helper';

export type CoreOptions = {
  tempConfig: TemplateConfig;
  plugins: PluginConfig[];
  projectPath: string;
};
export type FileContext = {
  code: string;
  helper: typeof Helper;
};
// function createFileContext() {
//   return {
//     code: '',
//     helper: Helper,
//     path: '',
//   };
// }
// function createCoreContext() {
//   return {
//     files: [],
//     invokeStarts: [],
//     invokeEnds: [],
//   };
// }

// export function createPluginCore({ tempConfig, plugins, projectPath }: CoreOptions) {
//   const context = createCoreContext();
//   const pluginCore = {
//     context,
//   };
//   return pluginCore;
// }
