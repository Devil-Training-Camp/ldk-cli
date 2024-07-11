import { basename } from 'path';

import { injectPrompt, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  injectPrompt(
    [
      {
        name: 'typescript',
        type: 'confirm',
        message: `Use typescript?`,
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
    false,
  );
  onTransform(({ projectPath, file, helper, options }) => {
    const { id, code } = file;
    if (options.global.typescript) {
      if (/package.json/.test(id)) {
        const pkgHelper = helper.parseJson(code);
        const name = basename(projectPath);
        pkgHelper.injectName(name);
        pkgHelper.injectDevDependencies({
          typescript: '~5.3.3',
        });
        file.code = pkgHelper.tryStringify();
      }
      if (/src[\\/]main.js/.test(id)) {
        file.path = file.path.replace('.js', '.ts');
      }
    } else {
      const removeFiles = [
        'vite-env.d.ts',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
      ];
      if (removeFiles.includes(basename(id))) {
        file.path = '';
      }
    }
  });
};
export default plugin;
