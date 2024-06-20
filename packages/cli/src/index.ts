import { Command } from 'commander';

const program = new Command();
export interface CreateOptions {
  template?: string;
  force: boolean;
}
program
  .command('create <projectName>')
  .description('Create new project')
  .option('-t --template <templateUrl>', 'Install template')
  .option('-f --force', 'Force overwrite when project is existed', false)
  .action(async (projectName: string, options: CreateOptions) => {
    const { create } = await import('./commands/create.js');
    create(projectName, options);
  });

program
  .command('temp')
  .description('Manage templates')
  .option('--add <templateUrl>', 'Install template')
  .option('--remove <templateName>', 'Remove template')
  .option('--update <templateName>', 'Update template')
  .option('--all', 'Manage all Templates', false)
  .action(async (projectName: string, options: CreateOptions) => {
    const { create } = await import('./commands/create.js');
    create(projectName, options);
  });

program.parse();
