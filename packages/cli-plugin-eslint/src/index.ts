import { type Plugin } from '@ldk/plugin-core';

const plugin: Plugin = async context => {
  console.log(context.helper.tryParse(`{"name": "eslint"}`));
  console.log('cli-plugin-eslint');
};
export default plugin;
