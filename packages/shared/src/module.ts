import { pathToFileURL } from 'url';
import { resolve } from 'path';
export function moduleLoader<T>(path: string): (file?: string) => Promise<T>;
export function moduleLoader<T>(path: string, file: string): Promise<T>;

export function moduleLoader<T>(path: string, file?: string) {
  if (file) {
    return loadModule<T>(path, file);
  }
  return (file = '') => loadModule<T>(path, file);
}

export async function loadModule<T>(path: string, file = '') {
  const moduleURL = pathToFileURL(resolve(path, file)).href;
  const importedModule = await import(moduleURL);
  return importedModule.default as T; // 假设导入的模块使用了 ES 模块的 default 导出
}

const moduleTypeMap = {
  cjs: 'main',
  esm: 'module',
};
type ModuleTypeMap = typeof moduleTypeMap;
type ModuleType = keyof ModuleTypeMap;

export async function getModuleEntry(path: string, type: ModuleType = 'esm') {
  const moduleType = moduleTypeMap[type];
  const pkg = await loadModule<Record<string, string>>(resolve(path, 'package.json'));
  return pkg[moduleType];
}