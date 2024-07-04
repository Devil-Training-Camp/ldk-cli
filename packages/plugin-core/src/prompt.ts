import type { QuestionCollection } from 'inquirer';
import inquirer from 'inquirer';

import { onInjectPrompt } from './hook.js';
export async function injectPrompt(question: QuestionCollection) {
  onInjectPrompt(async context => {
    const answer = await inquirer.prompt(question);
    context.options = {
      ...context.options,
      ...answer,
    };
  });
}
