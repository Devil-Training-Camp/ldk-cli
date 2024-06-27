import { execSync } from 'child_process';

import { PKG_MANAGER } from '@ldk/shared';
import fse from 'fs-extra';
import { parseJson } from '@ldk/plugin-helper';

import { PLUGIN_CACHE_DIR, PLUGIN_PKG_FILE } from './constant.js';

import type { PluginConfig } from './index.js';

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
    (prev, { name }) => {
      prev[name] = 'latest';
      return prev;
    },
    {} as Record<string, string>,
  );
  jsonHepler.injectDependencies(deps);
  await fse.writeFile(PLUGIN_PKG_FILE, jsonHepler.tryStringify());
}
