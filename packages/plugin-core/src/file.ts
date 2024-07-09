import { resolve } from 'path';

import fse from 'fs-extra';
import { glob } from 'glob';
import { isOfficialPlugin } from '@ldk/plugin-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import { TEMPLATE_IGNORE_DIRS_RE } from '@ldk/template-manager';

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

export async function createProjectFiles(
  projectPath: string,
  tempPath: string | undefined,
  pluginConfigs: PluginConfig[],
) {
  const pluginPaths = pluginConfigs.map(config => {
    return resolve(config.local, isOfficialPlugin(config.name) ? 'template' : '');
  });
  const dirPaths = [...pluginPaths];
  if (tempPath) {
    dirPaths.unshift(tempPath);
  }
  const filesArr = await Promise.all(dirPaths.map(genProjectFiles.bind(null, projectPath)));
  return concatFiles(filesArr);
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
  const filePaths = await glob(`${dirPath}/**/*`, {
    nodir: true,
    dot: true,
    absolute: true,
    ignore: {
      ignored: p => TEMPLATE_IGNORE_DIRS_RE.test(p.path),
    },
  });
  const files = [];
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

export async function writeProjectFiles(projectPath: string, files: TempFiles) {
  if (fse.existsSync(projectPath)) {
    await fse.remove(projectPath);
  }
  for (const { path, code, extras } of files) {
    await fse.outputFile(path, code);
    for (const [exPath, exCode] of Object.entries(extras)) {
      await fse.outputFile(exPath, exCode);
    }
  }
}
