import { resolve, basename, normalize } from 'path';

import { PACKAGES_RIR, getLocalConfig, isDev, loadModule } from '@ldk-cli/shared';
import fse from 'fs-extra';
import type { PkgJson } from '@ldk-cli/plugin-helper';
import { parseJson } from '@ldk-cli/plugin-helper';
import { oraPromise } from 'ora';
import chalk from 'chalk';
import { execa } from 'execa';

import { PLUGIN_CACHE_DIR, PLUGIN_PKG_FILE, isOfficialPlugin } from './constant.js';
import type { PluginConfig } from './manager.js';

const localConfig = getLocalConfig();

// ！！注意
// 在 monorepo 架构下，在本地 dev 环境开发脚手架官方插件开发时
// 官方插件会依赖脚手架仓库其他包，dependencies 方式为 "@ldk-cli/shared": "workspace:*",
// 如果将插件依赖包注入缓存目录中 package.json
// "@ldk-cli/cli-plugin-eslint": "file:///D:/myTest/ldk-cli/packages/cli-plugin-eslint"
// 那么在安装插件时，cli-plugin-eslint 官方插件的 dependencies "@ldk-cli/shared": "workspace:*" 就会报错
// 解决方案：
// 对于本地插件，不再注入缓存目录中 package.json，直接指定插件目录读取插件
export async function parsePluginPath(nameOrPath: string) {
  if (isDev() && isOfficialPlugin(nameOrPath)) {
    const pkgName = basename(nameOrPath);
    nameOrPath = resolve(PACKAGES_RIR, pkgName);
  }
  if (fse.existsSync(nameOrPath)) {
    nameOrPath = normalize(nameOrPath);
    const pkgPath = resolve(nameOrPath, 'package.json');
    // import 导入的 json 对象是 is not extensible 不可扩展新属性的
    const pkg = await loadModule<PkgJson>(pkgPath);
    return {
      name: pkg.name,
      version: '',
      local: nameOrPath,
    };
  }
  return {
    name: nameOrPath,
    version: 'latest',
    local: '',
  };
}
async function initPkgDir() {
  if (fse.existsSync(PLUGIN_PKG_FILE)) return;
  if (fse.existsSync(PLUGIN_CACHE_DIR)) {
    await fse.remove(PLUGIN_CACHE_DIR);
  }
  await fse.ensureDir(PLUGIN_CACHE_DIR);
  await execa(localConfig.pkgManager as string, ['init'], {
    cwd: PLUGIN_CACHE_DIR,
    stdout: 'ignore',
  });
}
export async function installPkgs(configs: PluginConfig[]) {
  await initPkgDir();
  const code = await fse.readFile(PLUGIN_PKG_FILE, 'utf-8');
  const jsonHelper = parseJson(code);
  const deps = configs.reduce(
    (prev, { name, version, local }) => {
      if (local) {
        return prev;
      }
      prev[name] = version;
      return prev;
    },
    {} as Record<string, string>,
  );
  jsonHelper.injectDependencies(deps, true);
  await fse.writeFile(PLUGIN_PKG_FILE, jsonHelper.tryStringify());
  await execa(localConfig.pkgManager as string, ['i'], {
    cwd: PLUGIN_CACHE_DIR,
    stdout: 'ignore',
  });
  configs.forEach(config => {
    if (config.local === '') {
      config.local = resolve(PLUGIN_CACHE_DIR, 'node_modules', config.name);
    }
  });
}
export async function installPkgsWithOra(configs: PluginConfig[]) {
  try {
    await oraPromise(installPkgs(configs), {
      successText: `plugins installed successfully`,
      failText: `Failed to install plugins`,
      text: 'Loading install',
    });
  } catch (error) {
    console.error(chalk.bgRed('ERROR') + chalk.red(' Failed to install plugins:'), error);
  }
}
