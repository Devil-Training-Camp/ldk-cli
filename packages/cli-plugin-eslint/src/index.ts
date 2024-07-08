import { injectPrompt, onInvokeStart, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  onInvokeStart(context => {
    const { projectPath } = context;
    console.log(`plugin-eslint onInvokeStart at ${projectPath}`);
  });
  injectPrompt([
    {
      name: 'check',
      type: 'list',
      message: `Choice template`,
      choices: [
        {
          name: '严格检测',
          value: true,
        },
        {
          name: '非严格检测',
          value: false,
        },
      ],
    },
  ]);
  onTransform(({ file: { path, code }, options }) => {
    console.log(options);
    console.log(`plugin-eslint onTransform at ${path}, and code ${code}`);
  });
};
export default plugin;
