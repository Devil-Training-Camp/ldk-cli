# ldk-cli

A CLI that can be extended arbitrarily.

- Manage [Templates][1]
- Extend with [plugins][2]

You can specify any online Git repository or a directory or local directory of the repository as a template, and `ldk-cli` will install and manage them. `ldk-cli` also provides a plugin system to extend CLI.

## Installation

Recommend using pnpm.

```bash
pnpm install @ldk-cli/cli -g
```

npm:

```bash
npm install @ldk-cli/cli -g
```

yarn:

```bash
yarn global add @ldk-cli/cli
```

Check if the installation was successful.

```bash
ldk-cli -V
```

## Usage

Create a project:

```bash
ldk-cli create <projectName>

# <projectName> can be a path relative to the current shell
ldk-cli create ./my-project

# Specify a template
ldk-cli create ./my-project -t https://github.com/Devil-Training-Camp/virtual-scroll-list-liudingkang.git

```

If you run `ldk-cli create ./online-test6`:

![create][3]

All options:

```
Usage: ldk-cli create [options] <projectName>

Create new project

Options:
  -t --template <templateUrl>  Install template
  -f --force                   Force overwrite when project is existed (default: false)
  -h, --help                   display help for command
```

## Template

Add a template:

```bash
ldk-cli temp --add https://github.com/Devil-Training-Camp/virtual-scroll-list-liudingkang.git

# Specify branch
ldk-cli temp --add https://github.com/Devil-Training-Camp/ldk-cli#dev

# Specific directory
ldk-cli temp --add https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli#main

# Simplify a URL
ldk-cli temp --add Devil-Training-Camp/ldk-cli?temp=packages/cli#dev

# Add local template
ldk-cli temp --add  D:\develop\vue3\ldk-cli\packages\cli
```

Online templates and local templates can be specified, and online templates will be automatically cached.

If you run `ldk-cli temp --add https://github.com/Devil-Training-Camp/virtual-scroll-list-liudingkang.git`:

![temp][4]

The added template will be available for selection when executing the create command:

![create-temp][5]

→ See [templates][6] for more details.

## Plugin

You can add plugins to extend CLI, these are some official plugins currently supported:

| Plugin                            | Description                             |
| --------------------------------- | --------------------------------------- |
| [@ldk-cli/cli-plugin-base][7]     | Vite and Typescript plugin for ldk-cli  |
| [@ldk-cli/cli-plugin-eslint][8]   | ESLint plugin for ldk-cli               |
| [@ldk-cli/cli-plugin-prettier][9] | Prettier plugin for ldk-cli             |
| [@ldk-cli/cli-plugin-vue][10]     | Vue plugin with vite for ldk-cli        |
| [@ldk-cli/cli-plugin-router][11]  | Vue router plugin with vite for ldk-cli |

→ See [plugins][12] for documentation to write plugins.
→ See [custom plugins][13] for documentation to write plugins.

[1]: #template
[2]: #plugin
[3]: /docs/assets/ldk-cli-create.gif
[4]: /docs/assets/ldk-cli-temp-add.gif
[5]: /docs/assets/ldk-cli-create-temp.gif
[6]: /packages/template-manager/README.md
[7]: /packages/cli-plugin-base/README.md
[8]: /packages/cli-plugin-eslint/README.md
[9]: /packages/cli-plugin-prettier/README.md
[10]: /packages/cli-plugin-vue/README.md
[11]: /packages/cli-plugin-router/README.md
[12]: /packages/plugin-manager/README.md
[13]: /packages/plugin-core/README.md
