import { onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onTransform(({ file, helper, options }) => {
    const { code, id } = file;
    if (/package.json/.test(id)) {
      console.log(options);
      let defaultDeps: Record<string, string> = {
        eslint: '^8.51.0',
        'eslint-config-standard': '^17.1.0',
        'eslint-plugin-import': '^2.28.1',
      };
      if (options.global.typescript) {
        defaultDeps = {
          'eslint-import-resolver-typescript': '^3.6.1',
          '@typescript-eslint/eslint-plugin': '^6.7.5',
          '@typescript-eslint/parser': '^6.7.5',
          ...defaultDeps,
        };
      }
      const pkgHelper = helper.parseJson(code);
      pkgHelper.injectDevDependencies(defaultDeps);
      console.log(pkgHelper.tryStringify());
      file.code = pkgHelper.tryStringify();
    }
  });
};
export default plugin;
