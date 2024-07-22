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

export const manageActions = ['--add', '--remove', '--update', '--show'] as const;
export type ManageAction = (typeof manageActions)[number];

program
  .command('temp <action> [nameOrPath]')
  .description('Manage templates')
  .allowUnknownOption()
  .action(async (action: ManageAction, nameOrPath?: string) => {
    const { template } = await import('./commands/template.js');
    template(action, nameOrPath);
  });

program
  .command('plugin <action> [nameOrPath]')
  .description('Manage plugins')
  .allowUnknownOption()
  .action(async (action: ManageAction, nameOrPath?: string) => {
    const { plugin } = await import('./commands/plugin.js');
    plugin(action, nameOrPath);
  });
program
  .command('config [key] [value]')
  .description('Global config')
  .allowUnknownOption()
  .action(async (key?: string, value?: string) => {
    const { config } = await import('./commands/config.js');
    config(key, value);
  });

program.parse();
