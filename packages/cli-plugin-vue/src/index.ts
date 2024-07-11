import { basename } from 'path';

import { onInvokeStart, onTransform, type PluginFn } from '@ldk/plugin-core';
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
  onInvokeStart(({ options }) => {
    options.global.vue = true;
  });
  onTransform(({ projectPath, file, helper, options }) => {
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
      const renameFiles = ['vite.config.js'];
      if (/src[\\/]main.js/.test(id) || renameFiles.includes(basename(id))) {
        file.path = file.path.replace('.js', '.ts');
      }
      if (/tsconfig.app.json/.test(id)) {
        const eslintConfig = JSON.parse(file.code) as TsConfig;
        eslintConfig.compilerOptions.jsx = 'preserve' as unknown as ts.JsxEmit;
        eslintConfig.include?.push(...['src/**/*.tsx', 'src/**/*.vue']);
        file.code = JSON.stringify(eslintConfig, null, 2);
      }
      const vueFiles = ['App.vue', 'HelloWorld.vue'];
      if (vueFiles.includes(basename(id))) {
        file.code = file.code.replace(`<script setup`, `<script setup lang="ts"`);
      }
      if (/index.html/.test(id)) {
        file.code = file.code.replace(`src="/src/main.js"`, `src="/src/main.ts"`);
      }
    }
  });
};
export default plugin;
