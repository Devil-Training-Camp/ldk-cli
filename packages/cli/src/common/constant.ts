import os from 'os';
import { join } from 'path';

import { getLocalConfig } from '../core/config.js';

const USER_HOME = os.homedir();
const DEFAULT_CACHE_DIR = join(USER_HOME, '.ldk-cache');
const localConfig = getLocalConfig();
const CACHE_DIR = localConfig.cacheDir || DEFAULT_CACHE_DIR;

export const CWD = process.cwd();
export const LOCAL_CONFIG_FILE = join(USER_HOME, '.ldkrc');
export const CACHE_CONFIG_FILE = join(CACHE_DIR, '.ldk-cache.json');
export const PLUGIN_CACHE_DIR = join(CACHE_DIR, 'plugins');
export const TEMPLATE_CACHE_DIR = join(CACHE_DIR, 'templates');

// 应该动态读取 packages
export const OFFICIAL_TEMPLATES = [
  'https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git',
  'https://github.com/grey-coat/virtual-scroll-list-liudingkang-build-test.git',
];
