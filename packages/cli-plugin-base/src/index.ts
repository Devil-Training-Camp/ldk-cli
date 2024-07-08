import { basename, resolve } from 'path';

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
    if (/test.js/.test(path)) {
      file.path = file.path.replace('.js', '.ts');
      const pagePath = resolve(projectPath, 'src/views/HelloWord.vue');
      file.extras[pagePath] = `<Template>hello world</Template>`;
    }
    console.log(`plugin-base onTransform at ${path}, and code ${code}`);
  });
};
export default plugin;
