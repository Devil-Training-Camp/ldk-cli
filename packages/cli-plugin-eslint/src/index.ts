import { onInvokeStart, onRender, onTransform, type PluginFn } from '@ldk-cli/plugin-core';
import type { Linter } from 'eslint';

const plugin: PluginFn = async context => {
  onInvokeStart(async ({ inquirer }) => {
    const { eslint } = await inquirer.prompt([
      {
        name: 'eslint',
        type: 'confirm',
        message: `Use eslint?`,
        choices: [
          {
            name: 'Yes',
            value: true,
          },
          {
            name: 'No',
            value: false,
          },
        ],
      },
    ]);
    context.options.eslint = eslint;
  });
  onRender(({ render }) => {
    if (context.options.eslint) {
      render('../template');
    }
  });
  onTransform(async ({ file, helper }) => {
    if (!context.options.eslint) {
      return;
    }
    const { code, id } = file;
    if (/package.json/.test(id)) {
      let defaultDeps: Record<string, string> = {
        eslint: '^8.51.0',
        'eslint-config-standard': '^17.1.0',
        'eslint-plugin-import': '^2.28.1',
      };
      if (context.options.typescript) {
        defaultDeps = {
          ...defaultDeps,
          'eslint-import-resolver-typescript': '^3.6.1',
          '@typescript-eslint/eslint-plugin': '^6.7.5',
          '@typescript-eslint/parser': '^6.7.5',
        };
      }
      const pkgHelper = helper.parseJson(code);
      pkgHelper.injectDevDependencies(defaultDeps);
      file.code = pkgHelper.tryStringify();
    }
    if (/.eslintrc.json/.test(id)) {
      const eslintConfig = JSON.parse(file.code) as Linter.Config;
      let newConfig = eslintConfig;
      if (context.options.typescript) {
        newConfig = {
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
            '@typescript-eslint/consistent-type-imports': 2, // type 标注类型导入
            '@typescript-eslint/ban-types': 0,
          },
          settings: {
            'import/resolver': {
              ...eslintConfig.settings?.['import/resolver'],
              typescript: true,
            },
          },
        };
      }
      file.code = JSON.stringify(newConfig, null, 2);
    }
  });
};
export default plugin;
