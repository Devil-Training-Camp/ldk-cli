import { basename } from 'path';

import { injectPrompt, onTransform, type PluginFn } from '@ldk/plugin-core';

const plugin: PluginFn = async () => {
  injectPrompt(
    [
      {
        name: 'typescript',
        type: 'confirm',
        message: `Use typescript?`,
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
  onTransform(({ projectPath, file, helper, options }) => {
    const { id, code } = file;
    if (/package.json/.test(id)) {
      console.log(options);
      const pkgHelper = helper.parseJson(code);
      const name = basename(projectPath);
      pkgHelper.injectName(name);
      file.code = pkgHelper.tryStringify();
    }
  });
};
export default plugin;
