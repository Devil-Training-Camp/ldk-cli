import fse from 'fs-extra';
import { glob } from 'glob';

export type Files = Record<string, string>;

export async function genProjectFiles(dirPath: string, projectPath: string) {
  const filePaths = await glob(dirPath);
  const files = {} as Files;
  for (const filePath of filePaths) {
    const [path, code] = await genProjectFile(filePath, dirPath, projectPath);
    files[path] = code;
  }
  console.log(filePaths);
  return files;
}
async function genProjectFile(filePath: string, dirPath: string, projectPath: string) {
  const code = await fse.readFile(filePath, 'utf-8');
  const path = filePath.replace(dirPath, projectPath);
  return [path, code];
}
