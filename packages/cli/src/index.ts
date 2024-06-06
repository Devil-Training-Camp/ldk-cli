import { Command } from 'commander';

const program = new Command();
export interface CreateOptions {
  template: string;
}
program
  .command('create')
  .description('Create new project')
  .option('-t --template <templateUrl>', 'Install template')
  .action(async (options: CreateOptions) => {
    const { create } = await import('./commands/create.js');
    create(options);
  });

program.parse();
