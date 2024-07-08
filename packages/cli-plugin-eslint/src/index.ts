import { basename } from 'path';

import { injectPrompt, onInvokeStart, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onInvokeStart(context => {
    const { projectPath } = context;
    console.log(`plugin-eslint invokeStart at ${projectPath}`);
  });
  injectPrompt([
    {
      name: 'check',
      type: 'list',
      message: `Choice template`,
      choices: [
        {
          name: '严格检测',
          value: true,
        },
        {
          name: '非严格检测',
          value: false,
        },
      ],
    },
  ]);
  onTransform(context => {
    const { projectPath, path, helper, code, options } = context;
    console.log(options);
    if (/package.json/.test(path)) {
      const pkgHelper = helper.parseJson(code);
      const name = basename(projectPath);
      pkgHelper.injectName(name);
      context.code = pkgHelper.tryStringify();
    }
    console.log(`plugin-eslint invokeEnd at ${path}, and code ${code}`);
  });
};
export default plugin;
