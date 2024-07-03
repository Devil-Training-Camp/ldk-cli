import { onInvokeStart, type Plugin } from '@ldk/plugin-core';

const plugin: Plugin = async () => {
  onInvokeStart(context => {
    console.log(`plugin-router invokeStart at ${context.path}`);
  });
};
export default plugin;
