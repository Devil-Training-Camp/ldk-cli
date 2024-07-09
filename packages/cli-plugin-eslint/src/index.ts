import { onTransform, type PluginFn } from '@ldk/plugin-core';
import type { Linter } from 'eslint';

const plugin: PluginFn = async () => {
  onTransform(async ({ file, helper, options }) => {
    const { code, id } = file;
    if (/package.json/.test(id)) {
      console.log(options);
      let defaultDeps: Record<string, string> = {
        eslint: '^9.0.0',
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
      file.code = pkgHelper.tryStringify();
    }
    if (/eslint.config.js/.test(id)) {
      if (options.global.typescript) {
        const eslintConfig = (await import('../template/eslint.config.js'))
          .default as unknown as Linter.Config;
        const newConfig = {
          ...eslintConfig,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: '@typescript-eslint/parser',
          },
          extends: [
            ...(eslintConfig.extends as string[]),
            ...['plugin:import/typescript', 'plugin:@typescript-eslint/recommended'],
          ],
          plugins: ['@typescript-eslint'],
          rules: {
            ...eslintConfig.rules,
            '@typescript-eslint/consistent-type-imports': [2], // type 标注类型导入
            '@typescript-eslint/ban-types': [0],
          },
        };
        const configHelper = helper.parseJs(`export default ${JSON.stringify(newConfig, null, 2)}`);
        file.code = configHelper.getCode();
      }
    }
  });
};
export default plugin;
