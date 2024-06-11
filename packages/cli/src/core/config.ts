import { readFile } from 'fs/promises';

import { LOCAL_CONFIG_FILE } from '../common/constant.js';

export interface LocalConfig {
  cacheDir?: string;
}

const localConfig: LocalConfig = await getLocalConfigAsync();
export function getLocalConfig() {
  return localConfig;
}
export async function getLocalConfigAsync() {
  try {
    const code = await readFile(LOCAL_CONFIG_FILE, 'utf8');
    return JSON.parse(code);
  } catch (error) {
    return {};
  }
}
