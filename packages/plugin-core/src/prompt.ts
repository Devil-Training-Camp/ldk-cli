import type { QuestionCollection } from 'inquirer';
import inquirer from 'inquirer';

import { onInjectPrompt } from './hook.js';
export function injectPrompt(question: QuestionCollection) {
  onInjectPrompt(async context => {
    const answer = await inquirer.prompt(question);
    Object.assign(context.options, answer);
  });
}
