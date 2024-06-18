import os from 'os';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';

import fse from 'fs-extra';
import chalk from 'chalk';

import type { TemplateConfig } from '../core/template.js';

const { remove, existsSync } = fse;
const USER_HOME = os.homedir();
const DEFAULT_CACHE_DIR = join(USER_HOME, '.ldk-cache');

export const CWD = process.cwd();
export const LOCAL_CONFIG_FILE = join(USER_HOME, '.ldkrc');
export const OFFICIAL_TEMPLATES = [
  'https://github.com/grey-coat/virtual-scroll-list-liudingkang-test',
  'https://github.com/grey-coat/virtual-scroll-list-liudingkang-build-test',
  'https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#main',
  'https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli#main',
  'https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli#main',
];

export interface LocalConfig {
  cacheDir?: string;
}
const defaultLocalConfig: LocalConfig = {};
const localConfig: LocalConfig = (await getConfigAsync(LOCAL_CONFIG_FILE)) || defaultLocalConfig;

const CACHE_DIR = localConfig.cacheDir || DEFAULT_CACHE_DIR;
export const CACHE_CONFIG_FILE = join(CACHE_DIR, '.ldk-cache.json');
export const PLUGIN_CACHE_DIR = join(CACHE_DIR, 'plugins');
export const TEMPLATE_CACHE_DIR = join(CACHE_DIR, 'templates');

export function getLocalConfig() {
  return localConfig;
}
export async function setLocalConfigAsync() {
  await setConfigAsync<LocalConfig>(LOCAL_CONFIG_FILE, localConfig);
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
    const code = JSON.stringify(config);
    await writeFile(path, code);
    return JSON.parse(code);
  } catch (error) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to update config: '), error);
  }
}

export const DEFAULT_BRANCH = 'main';
