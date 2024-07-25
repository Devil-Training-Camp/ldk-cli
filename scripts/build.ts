import { spawnSync } from 'child_process';
const args = process.argv.slice(2);
const targets = args.length
  ? args
  : [
      'shared',
      'plugin-helper',
      'template-manager',
      'plugin-manager',
      'plugin-core',
      'cli-plugin-base',
      'cli-plugin-eslint',
      'cli-plugin-prettier',
      'cli-plugin-vue',
      'cli-plugin-router',
      'cli',
    ];

async function build() {
  for (const target of targets) {
    spawnSync(`pnpm`, ['build'], {
      cwd: `./packages/${target}`,
      stdio: 'inherit',
      shell: true,
    });
  }
}
build();
