import { resolve } from 'path';

import fse from 'fs-extra';
import { glob } from 'glob';
import { isOfficialPlugin } from '@ldk/plugin-manager';
import type { PluginConfig } from '@ldk/plugin-manager';
import { TEMPLATE_IGNORE_DIRS_RE } from '@ldk/template-manager';

export type TempFiles = Record<string, string>;

export async function concatProjectFiles(
  projectPath: string,
  tempPath: string,
  pluginConfigs: PluginConfig[],
) {
  const pluginPaths = pluginConfigs.map(config => {
    return resolve(config.local, isOfficialPlugin(config.name) ? 'template' : '');
  });
  const dirPaths = [tempPath, ...pluginPaths];
  const filesArr = await Promise.all(dirPaths.map(genProjectFiles.bind(null, projectPath)));
  const files: TempFiles = Object.assign({}, ...filesArr);
  return files;
}

export async function genProjectFiles(projectPath: string, dirPath: string) {
  const filePaths = await glob(`${dirPath}/**/*`, {
    nodir: true,
    absolute: true,
    ignore: {
      ignored: p => TEMPLATE_IGNORE_DIRS_RE.test(p.path),
    },
  });
  console.log(filePaths);
  const files = {} as TempFiles;
  for (const filePath of filePaths) {
    const [path, code] = await genProjectFile(filePath, dirPath, projectPath);
    files[path] = code;
  }
  return files;
}
async function genProjectFile(filePath: string, dirPath: string, projectPath: string) {
  const code = await fse.readFile(filePath, 'utf-8');
  const path = filePath.replace(dirPath, projectPath);
  console.log(filePath, code);
  return [path, code];
}
