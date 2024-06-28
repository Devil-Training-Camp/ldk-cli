import { execSync } from 'child_process';
import { resolve } from 'path';

import { PKG_MANAGER, isDev, isLocalPath } from '@ldk/shared';
import fse from 'fs-extra';
import type { PkgJson } from '@ldk/plugin-helper';
import { parseJson } from '@ldk/plugin-helper';
import { oraPromise } from 'ora';
import chalk from 'chalk';

import { PLUGIN_CACHE_DIR, PLUGIN_PKG_FILE } from './constant.js';

import type { PluginConfig } from './index.js';

export async function parsePluginPath(nameOrPath: string) {
  if (!isLocalPath(nameOrPath)) {
    return {
      name: nameOrPath,
      version: 'latest',
    };
  }
  const pkg: PkgJson = await import(resolve(nameOrPath, 'package.json'));
  return {
    name: pkg.name,
    version: nameOrPath,
  };
}
async function initPkgDir() {
  if (fse.existsSync(PLUGIN_PKG_FILE)) return;
  if (fse.existsSync(PLUGIN_CACHE_DIR)) {
    await fse.remove(PLUGIN_CACHE_DIR);
  }
  await fse.mkdir(PLUGIN_CACHE_DIR);
  execSync(`${PKG_MANAGER} init`, {
    cwd: PLUGIN_CACHE_DIR,
  });
}
export async function installPkgs(configs: PluginConfig[]) {
  await initPkgDir();
  const code = await fse.readFile(PLUGIN_PKG_FILE, 'utf-8');
  const jsonHepler = parseJson(code);
  const deps = configs.reduce(
    (prev, { name, version }) => {
      prev[name] = version;
      return prev;
    },
    {} as Record<string, string>,
  );
  jsonHepler.injectDependencies(deps, true);
  await fse.writeFile(PLUGIN_PKG_FILE, jsonHepler.tryStringify());
  if (isDev()) return;
  execSync(`${PKG_MANAGER} i`, {
    cwd: PLUGIN_CACHE_DIR,
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
    console.error(chalk.bgRed('ERROR') + chalk.red(' Failed to clone repository:'), error);
  }
}
