#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();

export interface CreateOptions {
  template: string;
}
program
  .command('create')
  .description('Create new project')
  .option('-t --template', 'Install template')
  .action(async (options: CreateOptions) => {
    const { create } = await import('./commands/create');
    create(options);
  });
