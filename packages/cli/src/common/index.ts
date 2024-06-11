import type { ActionTargetConfig } from './action.js';

export function transToPromptChoices(targetArr: ActionTargetConfig[]) {
  return targetArr.map(target => ({
    name: target.title,
    value: target.name,
  }));
}
export const isRemotePath = (str: string) => str.includes('https://');
export const isPath = (str: string) => str.includes('/');
