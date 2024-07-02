// import type { TemplateConfig } from '@ldk/template-manager';
// import type { PluginConfig } from '@ldk/plugin-manager';
// import * as Helper from '@ldk/plugin-helper';

// export type CoreOptions = {
//   tempConfig: TemplateConfig;
//   plugins: PluginConfig[];
//   projectPath: string;
// };
// export type FileContext = {
//   code: string;
//   helper: typeof Helper;
// };
// // export type PluginCore = {

// // }
// function createFileContext() {
//   return {
//     code: '',
//     helper: Helper,
//     path: '',
//   };
// }
// function createCoreContext() {
//   return {
//     core: null,
//     files: [],
//     invokeStarts: [],
//     invokeEnds: [],
//   };
// }

// export function createPluginCore({ tempConfig, plugins, projectPath }: CoreOptions) {
//   const context = createCoreContext();
//   const pluginCore = {
//     context,
//     async invoke() {
//       await new Promise(
//         plugins.map(async plugin => {
//           plugin;
//         }),
//       );
//     },
//   };
//   return pluginCore;
// }
