import type { QuestionCollection } from 'inquirer';
import inquirer from 'inquirer';

import { onInjectPrompt } from './hook.js';

/**
 *
 * @param question inquirer QuestionCollection.
 * @param isPrivate 是否是插件私有配置，默认为 true.
 * isPrivate 为 true 时，inquirer 返回的结果会被挂载在后续 hooks HookContext 的 options.plugin 上，
 * 反之挂载在 options.global。
 */
export function injectPrompt(question: QuestionCollection, isPrivate = true) {
  onInjectPrompt(async ({ options }) => {
    const answer = await inquirer.prompt(question);
    const target = isPrivate ? options.plugin : options.global;
    Object.assign(target, answer);
  });
}
