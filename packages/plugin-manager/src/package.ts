import { execSync } from 'child_process';

import { PKG_MANAGER } from '@ldk/shared';
import fse from 'fs-extra';

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
export async function installPkg(config: PluginConfig) {
  console.log(config);
  await initPkgDir();
}
