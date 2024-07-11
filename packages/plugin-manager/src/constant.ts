import { join } from 'path';

import { CACHE_DIR } from '@ldk/shared';

export const BUILD_IN_PLUGINS = ['@ldk/cli-plugin-base'];
export const OFFICIAL_PLUGINS = [
  '@ldk/cli-plugin-eslint',
  '@ldk/cli-plugin-vue',
  '@ldk/cli-plugin-router',
].concat(BUILD_IN_PLUGINS);
export const PLUGIN_CACHE_DIR = join(CACHE_DIR, 'plugins');
export const PLUGIN_PKG_FILE = join(PLUGIN_CACHE_DIR, 'package.json');

export function isOfficialPlugin(name: string) {
  return OFFICIAL_PLUGINS.includes(name);
}
export function isBuildInPlugin(name: string) {
  return BUILD_IN_PLUGINS.includes(name);
}
