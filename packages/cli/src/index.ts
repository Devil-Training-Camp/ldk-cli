import { Command } from 'commander';

const program = new Command();
export interface CreateOptions {
  template?: string;
}
program
  .command('create <projectName>')
  .description('Create new project')
  .option('-t --template <templateUrl>', 'Install template')
  .action(async (projectName: string, options: CreateOptions) => {
    const { create } = await import('./commands/create.js');
    create(projectName, options);
  });

program.parse();
