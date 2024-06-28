import os from 'os';
import { join, resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';

import fse from 'fs-extra';
import chalk from 'chalk';

import { mergeObject } from './utils.js';

const { remove, existsSync } = fse;
const USER_HOME = os.homedir();
const DEFAULT_CACHE_DIR = join(USER_HOME, '.ldk-cache');

export const PACKAGES_RIR = resolve(import.meta.filename, '../../../');
export const CWD = process.cwd();
export const LOCAL_CONFIG_FILE = join(USER_HOME, '.ldkrc');

export interface LocalConfig {
  cacheDir: string;
  pkgManager: 'npm' | 'pnpm' | 'yarn';
}
const defaultLocalConfig: LocalConfig = {
  pkgManager: 'pnpm',
  cacheDir: DEFAULT_CACHE_DIR,
};
const localConfig = mergeObject<LocalConfig>(
  defaultLocalConfig,
  await getConfigAsync(LOCAL_CONFIG_FILE),
);

export const CACHE_DIR = localConfig.cacheDir;
export const PKG_MANAGER = localConfig.pkgManager;
export const CACHE_CONFIG_FILE = join(CACHE_DIR, '.ldk-cache.json');

export function getLocalConfig() {
  return localConfig;
}
export async function setLocalConfigAsync() {
  await setConfigAsync<LocalConfig>(LOCAL_CONFIG_FILE, localConfig);
}

export interface CacheConfig {
  templates: [];
  plugins: [];
}
const defaultCacheConfig: CacheConfig = {
  templates: [],
  plugins: [],
};
const cacheConfig: CacheConfig = mergeObject(
  defaultCacheConfig,
  await getConfigAsync(CACHE_CONFIG_FILE),
);
export function getCacheConfig() {
  return cacheConfig;
}
export async function setCacheConfigAsync() {
  await setConfigAsync<CacheConfig>(CACHE_CONFIG_FILE, cacheConfig);
}

async function getConfigAsync(path: string) {
  try {
    const code = await readFile(path, 'utf8');
    return JSON.parse(code);
  } catch (error) {
    return;
  }
}
async function setConfigAsync<T>(path: string, config: T) {
  try {
    if (existsSync(path)) {
      await remove(path);
    }
    const code = JSON.stringify(config, null, 2);
    await writeFile(path, code);
  } catch (error) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to update config: '), error);
  }
}
