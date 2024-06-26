import { join } from 'path';

import { CACHE_DIR } from '@ldk/shared';

export const OFFICIAL_PLUGINS = ['@ldk/cli-plugin-eslint'];
export const PLUGIN_CACHE_DIR = join(CACHE_DIR, 'plugins');
export const PLUGIN_PKG_FILE = join(PLUGIN_CACHE_DIR, 'package.json');
