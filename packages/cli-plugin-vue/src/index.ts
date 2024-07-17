import { basename } from 'path';

import { injectPrompt, onRender, onTransform, type PluginFn } from '@ldk/plugin-core';
import type { CompilerOptions } from 'typescript';
import type ts from 'typescript';

interface TsConfig {
  compilerOptions: CompilerOptions;
  include: string[];
  exclude?: string[];
  files?: string[];
  references?: {
    path: string;
  }[];
}

const plugin: PluginFn = async () => {
  injectPrompt(
    [
      {
        name: 'vue',
        type: 'confirm',
        message: `Use vue?`,
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
    if (options.global.vue) {
      render('../template');
    }
  });
  onTransform(({ projectPath, file, helper, options }) => {
    if (!options.global.vue) {
      return;
    }
    const { id } = file;
    if (/package.json/.test(id)) {
      const pkgHelper = helper.parseJson(file.code);
      pkgHelper.injectDependencies({ vue: '^3.4.29' });
      pkgHelper.injectDevDependencies({ '@vitejs/plugin-vue': '^5.0.5' });
      file.code = pkgHelper.tryStringify();
    }
    if (/vite.config.js/.test(id)) {
      const jsHelper = helper.parseJs(file.code);
      jsHelper.addImports([`import vue from '@vitejs/plugin-vue'`]);
      jsHelper.viteAddPlugins(['vue()']);
      file.code = jsHelper.getCode();
    }
    if (options.global.typescript) {
      if (/package.json/.test(id)) {
        const pkgHelper = helper.parseJson(file.code);
        const name = basename(projectPath);
        pkgHelper.injectName(name);
        pkgHelper.injectDevDependencies({
          typescript: '~5.3.3',
        });
        pkgHelper.injectDevDependencies({ 'vue-tsc': '^2.0.21' });
        file.code = pkgHelper.tryStringify();
      }
      if (/tsconfig.app.json/.test(id)) {
        const eslintConfig = JSON.parse(file.code) as TsConfig;
        eslintConfig.compilerOptions.jsx = 'preserve' as unknown as ts.JsxEmit;
        eslintConfig.include?.push(...['src/**/*.tsx', 'src/**/*.vue']);
        file.code = JSON.stringify(eslintConfig, null, 2);
      }
      const vuePaths = ['App.vue', 'HelloWorld.vue'];
      if (vuePaths.includes(basename(id))) {
        file.code = file.code.replace(`<script setup`, `<script setup lang="ts"`);
      }
      if (/index.html/.test(id)) {
        file.code = file.code.replace(`src="/src/main.js"`, `src="/src/main.ts"`);
      }
    }
    if (options.global.eslint) {
      if (/package.json/.test(id)) {
        const pkgHelper = helper.parseJson(file.code);
        pkgHelper.injectDevDependencies({
          'eslint-plugin-vue': '^9.17.0',
          'vue-eslint-parser': '^9.3.2',
        });
        file.code = pkgHelper.tryStringify();
      }
      if (/.eslintrc.json/.test(id)) {
        const eslintConfig = JSON.parse(file.code);
        const newConfig = {
          ...eslintConfig,
          parser: 'vue-eslint-parser', // to lint vue
          extends: [...(eslintConfig.extends as string[]), ...['plugin:vue/vue3-recommended']],
          rules: {
            ...eslintConfig.rules,
            'vue/multi-word-component-names': [0],
          },
        };
        file.code = JSON.stringify(newConfig, null, 2);
      }
    }
  });
};
export default plugin;
