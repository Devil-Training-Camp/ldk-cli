import os from 'os';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';

import fse from 'fs-extra';
import chalk from 'chalk';

const { remove, existsSync } = fse;

const USER_HOME = os.homedir();
const DEFAULT_CACHE_DIR = join(USER_HOME, '.ldk-cache');

export const CWD = process.cwd();
export const LOCAL_CONFIG_FILE = join(USER_HOME, '.ldkrc');

export interface LocalConfig {
  cacheDir?: string;
}
const defaultLocalConfig: LocalConfig = {};
const localConfig: LocalConfig = (await getConfigAsync(LOCAL_CONFIG_FILE)) || defaultLocalConfig;

export const CACHE_DIR = localConfig.cacheDir || DEFAULT_CACHE_DIR;
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
const cacheConfig: CacheConfig = (await getConfigAsync(CACHE_CONFIG_FILE)) || defaultCacheConfig;
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
