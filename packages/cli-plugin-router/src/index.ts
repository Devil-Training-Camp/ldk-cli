import { onInvokeStart, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onInvokeStart(context => {
    const { projectPath } = context;
    console.log(`plugin-router invokeStart at ${projectPath}`);
  });
  onTransform(({ file, options }) => {
    const { path, code } = file;
    console.log(options);
    console.log(`plugin-router onTransform at ${path}, and code ${code}`);
  });
};
export default plugin;
