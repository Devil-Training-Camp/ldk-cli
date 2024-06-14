import { readFile, writeFile } from 'fs/promises';

import fse from 'fs-extra';
import chalk from 'chalk';

import { CACHE_CONFIG_FILE, LOCAL_CONFIG_FILE } from '../common/constant.js';

import type { TemplateConfig } from './template.js';

const { remove, existsSync } = fse;

export interface LocalConfig {
  cacheDir?: string;
}
const defaultLocalConfig: LocalConfig = {};
const localConfig: LocalConfig = (await getConfigAsync(LOCAL_CONFIG_FILE)) || defaultLocalConfig;
export function getLocalConfig() {
  return localConfig;
}
export async function setLocalConfigAsync(config: LocalConfig) {
  await setConfigAsync<LocalConfig>(LOCAL_CONFIG_FILE, config);
}
export interface CacheConfig {
  templates: TemplateConfig[];
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
export async function setCacheConfigAsync(config: CacheConfig) {
  await setConfigAsync<CacheConfig>(CACHE_CONFIG_FILE, config);
}
export async function getConfigAsync(path: string) {
  try {
    const code = await readFile(path, 'utf8');
    return JSON.parse(code);
  } catch (error) {
    return;
  }
}
export async function setConfigAsync<T>(path: string, config: T) {
  try {
    if (existsSync(path)) {
      await remove(path);
    }
    const code = JSON.stringify(config);
    await writeFile(path, code);
    return JSON.parse(code);
  } catch (error) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to update config: '), error);
  }
}
