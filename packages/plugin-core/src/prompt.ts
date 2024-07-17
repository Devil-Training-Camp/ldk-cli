import type { QuestionCollection } from 'inquirer';
import inquirer from 'inquirer';

import type { HookContext } from './hook.js';
import { onInjectPrompt } from './hook.js';
import type { PluginHookTypes } from './constant.js';

/**
 *
 * @param question inquirer QuestionCollection.
 * @param isPrivate 是否是插件私有配置，默认为 true.
 * isPrivate 为 true 时，inquirer 返回的结果会被挂载在后续 hooks HookContext 的 options.plugin 上，
 * 反之挂载在 options.global。
 * @param fn 是否注入 question，默认函数返回值为 true，即注入.
 */
export function injectPrompt(
  question: QuestionCollection,
  isPrivate = true,
  fn: (context: HookContext<PluginHookTypes.INJECT_PROMPT>) => boolean = () => true,
) {
  onInjectPrompt(async context => {
    const { options } = context;
    if (!fn(context)) return;
    const answer = await inquirer.prompt(question);
    const target = isPrivate ? options.plugin : options.global;
    Object.assign(target, answer);
  });
}
