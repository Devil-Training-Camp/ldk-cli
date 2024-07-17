import { injectPrompt, onRender, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  injectPrompt(
    [
      {
        name: 'prettier',
        type: 'confirm',
        message: `Use prettier?`,
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
    ],
    true,
    ({ options }) => options.global.eslint,
  );
  onRender(({ render, options }) => {
    if (options.plugin.prettier) {
      render('../template');
    }
  });
  onTransform(({ file, helper, options }) => {
    const { id } = file;
    if (!options.plugin.prettier) {
      return;
    }
    if (/package.json/.test(id)) {
      const pkgHelper = helper.parseJson(file.code);
      pkgHelper.injectDevDependencies({
        prettier: '^3.0.3',
        'eslint-plugin-prettier': '^5.0.1',
        'eslint-config-prettier': '^9.0.0',
      });
      file.code = pkgHelper.tryStringify();
    }
    if (/.eslintrc.json/.test(id)) {
      const eslintConfig = JSON.parse(file.code);
      const newConfig = {
        ...eslintConfig,
        extends: [
          ...(eslintConfig.extends as string[]),
          ...['plugin:prettier/recommended', 'prettier'],
        ],
      };
      file.code = JSON.stringify(newConfig, null, 2);
    }
  });
};
export default plugin;
