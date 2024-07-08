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
  onTransform(({ projectPath, file, helper, options }) => {
    console.log(options);
    const { path, code } = file;
    if (/package.json/.test(path)) {
      const pkgHelper = helper.parseJson(code);
      const name = basename(projectPath);
      pkgHelper.injectName(name);
      file.code = pkgHelper.tryStringify();
    }
    console.log(`plugin-eslint invokeEnd at ${path}, and code ${code}`);
  });
};
export default plugin;
