import fse from 'fs-extra';

import type { ActionTargetConfig } from './action.js';

const { lstatSync } = fse;

export function transToPromptChoices(targetArr: ActionTargetConfig[]) {
  return targetArr.map(target => ({
    name: target.title,
    value: target.name,
  }));
}
export const isRemotePath = (str: string) => str.includes('https://');
export const isPath = (str: string) => str.includes('/');
export const isLocalPath = (str: string) => {
  try {
    return lstatSync(str).isDirectory();
  } catch (error) {
    return false;
  }
};
export const mergeObject = <T extends object>(...args: Partial<T>[]): T =>
  Object.assign({}, ...args) as T;
