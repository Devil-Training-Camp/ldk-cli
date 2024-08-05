import { basename } from 'path';

import { onInvokeStart, onRender, onTransform, type PluginFn } from '@ldk-cli/plugin-core';

const plugin: PluginFn = async context => {
  onInvokeStart(async ({ inquirer }) => {
    if (context.options.bundler !== 'vite') return;
    const { typescript } = await inquirer.prompt([
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
    ]);
    context.options.typescript = typescript;
  });
  onRender(({ render }) => {
    if (context.options.bundler !== 'vite') return;
    if (context.options.typescript) {
      render('../template');
      return;
    }
    const renderFiles = [
      { from: '../template/src/main.js', to: './src/main.js' },
      { from: '../template/.gitignore', to: './.gitignore' },
      { from: '../template/index.html', to: './index.html' },
      { from: '../template/package.json', to: './package.json' },
      { from: '../template/vite.config.js', to: './vite.config.js' },
    ];
    renderFiles.forEach(({ from, to }) => {
      render(from, to);
    });
  });
  onTransform(({ projectPath, file, helper }) => {
    if (context.options.bundler !== 'vite') return;
    const { id, code } = file;
    if (context.options.typescript) {
      if (/package.json/.test(id)) {
        const pkgHelper = helper.parseJson(code);
        const name = basename(projectPath);
        pkgHelper.injectName(name);
        pkgHelper.injectVersion('0.0.0');
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
