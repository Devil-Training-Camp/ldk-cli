import { Command } from 'commander';

import { CLI_VERSION } from './constant.js';

export interface CreateOptions {
  template?: string;
  force: boolean;
}
const program = new Command('ldk-cli');

program.version(`@ldk-cli/cli ${CLI_VERSION}`);

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
  .allowUnknownOption()
  .description('Manage templates')
  .usage('<action> [nameOrPath]')
  .addHelpText(
    'after',
    `
<action>:
  --add  Add template
  --remove  Remove template
  --update  Update template
  --show  Show template
  `,
  )
  .action(async (action: ManageAction, nameOrPath?: string) => {
    const { template } = await import('./commands/template.js');
    template(action, nameOrPath);
  });

program
  .command('plugin <action> [nameOrPath]')
  .allowUnknownOption()
  .description('Manage plugins')
  .usage('<action> [nameOrPath]')
  .addHelpText(
    'after',
    `
<action>:
  --add  Add plugin
  --remove  Remove plugin
  --update  Update plugin
  --show  Show plugin
  `,
  )
  .helpOption(true)
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
