import { pathToFileURL } from 'url';
import { extname, resolve } from 'path';
import { createRequire } from 'module';

export function moduleLoader(path: string): <T>(file: string) => Promise<T>;
export function moduleLoader<T>(path: string, file: string): Promise<T>;
export function moduleLoader<T>(path: string, file?: string) {
  if (file) {
    return loadModule<T>(path, file);
  }
  return <T>(file: string) => loadModule<T>(path, file);
}

export async function loadModule<T>(path: string, file: string) {
  if (extname(path) === '.json') {
    const require = createRequire(resolve(path, './package.json'));
    return require(file);
  }
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
  const pkg = await loadModule<Record<string, string>>(path, './package.json');
  return pkg[moduleType];
}
