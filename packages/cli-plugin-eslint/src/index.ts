import { basename } from 'path';

import { onInvokeStart, type Plugin } from '@ldk/plugin-core';

const plugin: Plugin = async () => {
  onInvokeStart(context => {
    const { projectPath, path, helper, code } = context;
    if (/package.json/.test(path)) {
      const pkgHelper = helper.parseJson(code);
      const name = basename(projectPath);
      pkgHelper.injectName(name);
      context.code = pkgHelper.tryStringify();
    }
    console.log(`plugin-eslint invokeStart at ${path}, and code ${code}`);
  });
};
export default plugin;
