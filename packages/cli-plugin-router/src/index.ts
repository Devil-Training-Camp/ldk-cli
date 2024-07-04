import { onInvokeStart, type Plugin } from '@ldk/plugin-core';

const plugin: Plugin = async () => {
  onInvokeStart(context => {
    const { path, code } = context;
    console.log(`plugin-eslint invokeStart at ${path}, and code ${code}`);
  });
};
export default plugin;
