# @ldk-cli/plugin-core

The plugin core of `@ldk-cli/cli`. Provide the ability to extend CLI.

## Environment

You only need to use `@ldk-cli/plugin-core` as `peerDependencies` and `devDependencies`.

```json
{
  ...
  "devDependencies": {
    "@ldk-cli/plugin-core": "latest"
  },
  "peerDependencies": {
    "@ldk-cli/plugin-core": "latest"
  }
  ...
}
```

## Rule

You need to follow some rules.

### Directory structure

CLI will read the plugin entry from the `module (or main)` field of `package.json` in the plugin directory.

```
cli-plugin
└── package.json
```

### Plugin entry file

If your `package.json` is as follows:

```json
{
  "name": "cli-plugin",
  "module": "lib/index.js",
  "types": "lib/index.d.ts",
  "type": "module"
}
```

If you have a plugin with the following structure:

```
cli-plugin
├── package.json
├── lib
│   └── index.js
├── src
│   └── index.ts
└── tsconfig.json
```

So the entry file `src/index.js`:

```js
const plugin = async context => {
  if (context.options.bundler !== 'vite') return;
};
export default plugin;
```

## Demo

A plugin can be like the following:

```js
import { onInvokeStart, onRender } from '@ldk-cli/plugin-core';

const plugin = async context => {
  onInvokeStart(async ({ inquirer }) => {
    // inject user interaction
    const { vuex } = await inquirer.prompt([
      {
        name: 'vuex',
        type: 'confirm',
        message: `Use vuex?`,
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
    ]);
    context.options.vuex = vuex;
  });
  onRender(({ render }) => {
    // render dir
    if (context.options.vuex) {
      render('../template');
      return;
    }
  });
};
export default plugin;
```

## API reference

### Plugin Context

```ts
type PluginContext = {
  options: GlobalOptions;
};
```

#### GlobalOptions

You can mount some global variables for other plugins to use.

```ts
type GlobalOptions = Record<string, unknown> & {
  typescript: boolean;
  vue: boolean;
  eslint: boolean;
  bundler: string;
};
```

### Hooks

The plugin provides some hooks to execute at specific times.

![hook][1]

#### onInvokeStart

You can interact with users through `inquirer` in this hook, access projectPath, and use some helper functions.

It will only be executed once when the `create` command is executed.

```ts
import { onInvokeStart type PluginFn } from '@ldk-cli/plugin-core';

const plugin: PluginFn = async context => {
  onInvokeStart(async ({ inquirer }) => {
    const { typescript } = await inquirer.prompt([
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
    ]);
    context.options.typescript = typescript;
  });
};
export default plugin;
```

##### Context

```ts
type HookContext = {
  helper: typeof Helper;
  projectPath: string;
  options: Record<string, unknown>;
  [key: string]: unknown;
  inquirer: typeof inquirer;
};
```

##### inquirer

look for more details [inquirer][2].

#### onRender

In this hook, you can use the `render` function to specify the template that needs to be rendered.

It will only be executed once when the `create` command is executed.

```ts
import { onRender, type PluginFn } from '@ldk-cli/plugin-core';

const plugin: PluginFn = async context => {
  onRender(({ render }) => {
    if (context.options.typescript) {
      render('../template');
      return;
    }
    const renderFiles = [
      { from: '../template/src/main.js', to: './src/main.js' },
      { from: '../template/.gitignore', to: './.gitignore' },
      { from: '../template/index.html', to: './index.html' },
      { from: '../template/package.json', to: './package.json' },
      { from: '../template/vite.config.js', to: './vite.config.js' },
    ];
    renderFiles.forEach(({ from, to }) => {
      render(from, to);
    });
  });
};
export default plugin;
```

##### Context

```ts
type HookContext = {
  helper: typeof Helper;
  projectPath: string;
  options: Record<string, unknown>;
  [key: string]: unknown;
  render: function render(from: string, to?: string): void
};
```

##### render

- `from`: The relative path of the directory or file that needs to be rendered.
- `to`: Relative path to `projectPath`, the target will be rendered here.

```ts
function render(from: string, to?: string): void;
```

#### onTransform

In this hook, you can access the file and then modify the file code.

Each render template file will execute this hook once.

```ts
import { basename } from 'path';
import { onTransform, type PluginFn } from '@ldk-cli/plugin-core';

const plugin: PluginFn = async context => {
  onTransform(({ projectPath, file, helper }) => {
    const { id, code } = file;
    if (context.options.typescript) {
      // Inject fields into package.json using helper functions
      if (/package.json/.test(id)) {
        const pkgHelper = helper.parseJson(code);
        const name = basename(projectPath);
        pkgHelper.injectName(name);
        pkgHelper.injectVersion('0.0.0');
        pkgHelper.injectDevDependencies({
          typescript: '~5.3.3',
        });
        file.code = pkgHelper.tryStringify();
      }
      // rename file
      const renamePaths = ['vite.config.js', 'src/main.js'];
      if (helper.pathMatcher(renamePaths, id)) {
        file.path = file.path.replace('.js', '.ts');
      }
    }
  });
};
export default plugin;
```

##### Context

```ts
type HookContext = {
  helper: typeof Helper;
  projectPath: string;
  options: Record<string, unknown>;
  [key: string]: unknown;
  file: TempFile;
};
```

##### file

- `id`: Unique identifier of file.
- `path`: The file will be rendered to this path.
- `code`: file content.
- `extras`: For additional output files, you can use the `key` as the path and the `value` as the content of the file.

```ts
type TempFile = {
  id: string;
  path: string;
  code: string;
  extras: Record<string, string>;
};
```

#### onInvokeEnd

Similar to `onInvokeStart`, The final hook executed.

It will only be executed once when the `create` command is executed.

### Helper

Some function sets are used to rewrite files more easily.

→ See [plugin-helper][3] for more details.

[1]: ../../docs/assets/hook.png
[2]: https://github.com/SBoudrias/Inquirer.js
[3]: ../plugin-helper/README.md
