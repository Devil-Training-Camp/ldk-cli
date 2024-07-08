import { basename } from 'path';

import { onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onTransform(({ projectPath, file, helper, options }) => {
    console.log(options);
    const { path, code } = file;
    if (/package.json/.test(path)) {
      const pkgHelper = helper.parseJson(code);
      const name = basename(projectPath);
      pkgHelper.injectName(name);
      file.code = pkgHelper.tryStringify();
    }
    console.log(`plugin-base onTransform at ${path}, and code ${code}`);
  });
};
export default plugin;
