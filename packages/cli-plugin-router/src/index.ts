import { onInvokeStart, onRender, onTransform, type PluginFn } from '@ldk-cli/plugin-core';

const plugin: PluginFn = async context => {
  onInvokeStart(async ({ options, inquirer }) => {
    if (!context.options.vue) return;
    const { router } = await inquirer.prompt([
      {
        name: 'router',
        type: 'confirm',
        message: `Use vue router?`,
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
    options.router = router;
  });
  onRender(({ render, options }) => {
    if (options.router) {
      render('../template');
    }
  });
  onTransform(({ file, helper, options }) => {
    if (!options.router) {
      return;
    }
    const { id } = file;
    if (/package.json/.test(id)) {
      const pkgHelper = helper.parseJson(file.code);
      pkgHelper.injectDependencies({ 'vue-router': '^4.3.3' });
      file.code = pkgHelper.tryStringify();
    }
    if (/main.js/.test(id)) {
      let code = file.code;
      code = code.replace(`createApp(App);`, `createApp(App);\napp.use(router);`);
      const jsHelper = helper.parseJs(code);
      jsHelper.addImports([`import router from './router'`]);
      file.code = jsHelper.getCode();
    }
    if (context.options.typescript) {
      const renamePaths = ['router'];
      if (helper.pathMatcher(renamePaths, id)) {
        file.path = file.path.replace('.js', '.ts');
      }
      const vuePaths = ['views'];
      if (helper.pathMatcher(vuePaths, id)) {
        file.code = file.code.replace(`<script setup`, `<script setup lang="ts"`);
      }
    }
  });
};
export default plugin;
