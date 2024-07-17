import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import fse from 'fs-extra';
import { glob } from 'glob';
import { TEMPLATE_IGNORE_DIRS_RE } from '@ldk/template-manager';

import { curPlugin } from './plugin.js';
import { curPluginCoreIns } from './create.js';

export type TempFile = {
  id: string;
  path: string;
  code: string;
  extras: Record<string, string>;
};
export type TempFiles = TempFile[];

export function createFile(context?: Partial<TempFile>): TempFile {
  return {
    id: '',
    code: '',
    path: '',
    extras: {},
    ...context,
  };
}

export async function createProjectFiles() {
  if (curPluginCoreIns === null) return [];
  const { projectPath, temp, plugins } = curPluginCoreIns.context;

  const pluginPaths = plugins.map(plugin => plugin.paths);
  const dirPaths = pluginPaths.flat();
  if (temp) {
    dirPaths.unshift(temp.path);
  }
  const filesArr = await Promise.all(dirPaths.map(genProjectFiles.bind(null, projectPath)));
  return concatFiles(filesArr);
}

export function render(path: string) {
  const callerModule = getCallerModule();
  if (callerModule) {
    path = resolve(fileURLToPath(callerModule), '../', path);
  }
  if (curPlugin) {
    curPlugin.paths.push(path);
  }
}
function concatFiles(filesArr2: TempFile[][]) {
  const filesMap = new Map<string, TempFile>();
  const filesArr = filesArr2.flat();
  for (const file of filesArr) {
    filesMap.set(file.id, file);
  }
  return Array.from(filesMap.values());
}

async function genProjectFiles(projectPath: string, dirPath: string) {
  const files = [];
  if (fse.statSync(dirPath).isFile()) {
    const file = await genProjectFile(dirPath, dirname(dirPath), projectPath);
    return [file];
  }
  const filePaths = await glob(`${dirPath}/**/*`, {
    nodir: true,
    dot: true,
    absolute: true,
    ignore: {
      ignored: p => TEMPLATE_IGNORE_DIRS_RE.test(p.path),
    },
  });
  for (const filePath of filePaths) {
    const file = await genProjectFile(filePath, dirPath, projectPath);
    files.push(file);
  }
  return files;
}
async function genProjectFile(
  filePath: string,
  dirPath: string,
  projectPath: string,
): Promise<TempFile> {
  const code = await fse.readFile(filePath, 'utf-8');
  const path = filePath.replace(dirPath, projectPath);
  return createFile({ id: path, code, path });
}

export async function writeProjectFiles() {
  if (curPluginCoreIns === null) return;
  const { projectPath, files } = curPluginCoreIns.context;
  if (fse.existsSync(projectPath)) {
    await fse.remove(projectPath);
  }
  for (const { path, code, extras } of files) {
    if (path) {
      await fse.outputFile(path, code);
    }
    for (const [exPath, exCode] of Object.entries(extras)) {
      await fse.outputFile(exPath, exCode);
    }
  }
}

// 通过这种方法可以稳定获取 render 函数执行的位置，无论它在 onRender hook 中嵌套多少层
// eg. 如下 render 函数在 renderFiles.forEach 函数当中执行
// onRender(({ render, options }) => {
//   if (options.global.typescript) {
//     render('../template');
//     return;
//   }
//   render('../template/src/main.js');
//   const renderFiles = [
//     '../template/src/main.js',
//     '../template/.gitignore',
//     '../template/index.html',
//     '../template/package.json',
//     '../template/vite.config.js',
//   ];
//   renderFiles.forEach(render);
// });
function getCallerModule() {
  // 保留 prepareStackTrace
  const originalStackTrace = Error.prepareStackTrace;
  // 自定义 prepareStackTrace 获取调用者信息的堆栈帧。
  Error.prepareStackTrace = (err: Error, stack: NodeJS.CallSite[]) => stack;
  // 触发一个 Error 来获取调用堆栈
  const err = new Error();
  const stack: NodeJS.CallSite[] | undefined = err.stack as unknown as NodeJS.CallSite[];
  // 还原
  Error.prepareStackTrace = originalStackTrace;

  if (stack) {
    // 拿到 invokeHook 调用信息
    const invokeHookIndex = stack.findIndex(
      callSite => callSite.getFunctionName() === 'invokeHook',
    );
    // 在我的代码中，hook 回调函数在 invokeHook 函数内执行
    // invokeHookIndex - 1 拿到 hook 回调函数调用信息
    const callSite = stack[invokeHookIndex - 1];
    // 获取 hook 回调函数注册的模块名称
    const callerFile = callSite.getFileName();
    return callerFile || null;
  }

  return null;
}
