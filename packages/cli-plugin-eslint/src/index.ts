// import { basename } from 'path';

// import { injectPrompt, onInvokeEnd, type PluginFn } from '@ldk/plugin-core';

// const plugin: PluginFn = async () => {
//   injectPrompt([
//     {
//       name: 'check',
//       type: 'list',
//       message: `Choice template`,
//       choices: [
//         {
//           name: '严格检测',
//           value: true,
//         },
//         {
//           name: '非严格检测',
//           value: false,
//         },
//       ],
//     },
//   ]);
//   onInvokeEnd(context => {
//     const { projectPath, path, helper, code, options } = context;
//     console.log(options);
//     if (/package.json/.test(path)) {
//       const pkgHelper = helper.parseJson(code);
//       const name = basename(projectPath);
//       pkgHelper.injectName(name);
//       context.code = pkgHelper.tryStringify();
//     }
//     console.log(`plugin-eslint invokeStart at ${path}, and code ${code}`);
//   });
// };
// export default plugin;
