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

export const tempActions = ['--add', '--remove', '--update', '--show'] as const;
export type TempAction = (typeof tempActions)[number];
program
  .command('temp <action> [nameOrPath]')
  .description('Manage templates')
  .allowUnknownOption()
  .action(async (action: TempAction, nameOrPath?: string) => {
    const { template } = await import('./commands/template.js');
    template(action, nameOrPath);
  });

program.parse();
