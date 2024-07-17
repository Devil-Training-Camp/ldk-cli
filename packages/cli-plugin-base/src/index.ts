import { basename } from 'path';

import { injectPrompt, onRender, onTransform, type PluginFn } from '@ldk/plugin-core';

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
  onRender(({ render, options }) => {
    if (options.global.typescript) {
      render('../template');
      return;
    }
    render('../template/src/main.js');
    const renderFiles = [
      '../template/src/main.js',
      '../template/.gitignore',
      '../template/index.html',
      '../template/package.json',
      '../template/vite.config.js',
    ];
    renderFiles.forEach(render);
  });
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
      const renamePaths = ['vite.config.js', 'src/main.js'];
      if (helper.pathMatcher(renamePaths, id)) {
        file.path = file.path.replace('.js', '.ts');
      }
    }
  });
};
export default plugin;
