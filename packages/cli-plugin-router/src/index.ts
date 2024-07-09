import { onInvokeStart, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onInvokeStart(context => {
    const { projectPath } = context;
    console.log(`plugin-router onInvokeStart at ${projectPath}`);
  });
};
export default plugin;
