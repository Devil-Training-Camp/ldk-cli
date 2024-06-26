import { spawn } from 'child_process';
const args = process.argv.slice(2);
const targets = args.length
  ? args
  : [
      'shared',
      'template-manager',
      'plugin-manager',
      'cli-plugin-eslint',
      'plugin-core',
      'plugin-helper',
    ];

async function dev() {
  for (const target of targets) {
    spawn(`pnpm`, ['dev'], {
      cwd: `./packages/${target}`,
      stdio: 'inherit',
      shell: true,
    });
  }
}
dev();
