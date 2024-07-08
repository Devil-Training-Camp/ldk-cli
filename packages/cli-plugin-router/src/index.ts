import { onInvokeStart, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onInvokeStart(context => {
    const { projectPath } = context;
    console.log(`plugin-router invokeStart at ${projectPath}`);
  });
  onTransform(context => {
    const { path, code, options } = context;
    console.log(options);
    console.log(`plugin-router invokeEnd at ${path}, and code ${code}`);
  });
};
export default plugin;
