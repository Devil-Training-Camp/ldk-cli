# ldk-cli

A CLI that can be extended arbitrarily.

- Manage [Templates][1]
- Extend with [plugins][2]

You can specify any online Git repository or a directory or local directory of the repository as a template, and ldk cli will install and manage them. LDK CLI also provides a plugin system to extend CLI.

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
pnpm ldk-cli -V
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

If you run `ldk-cli create ./online-test6`

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

## Plugin

[1]: #template
[2]: #plugin
[3]: ./docs/assets/ldk-cli-create.gif
