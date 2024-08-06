import { pkgManagers, type PkgManager, getLocalConfig, setLocalConfigAsync } from '@ldk-cli/shared';
import inquirer from 'inquirer';
import { execa } from 'execa';

async function checkManager(manager: PkgManager) {
  try {
    await execa(manager, ['--version'], {
      stdout: 'ignore',
    });
    return true;
  } catch (error) {
    return false;
  }
}
export async function getLocalManagers() {
  const checkResults = await Promise.all(pkgManagers.map(checkManager));
  return pkgManagers.filter((manager, index) => checkResults[index]);
}
export async function pkgManagerPrompt() {
  const localManagers = await getLocalManagers();
  if (localManagers.length == 1) {
    return localManagers[0];
  }
  const { pkgManager }: { pkgManager: PkgManager } = await inquirer.prompt([
    {
      name: 'pkgManager',
      type: 'list',
      message: `Choose package manager?`,
      choices: localManagers.map(manager => ({ name: manager, value: manager })),
    },
  ]);
  return pkgManager;
}

export async function setPluginPkgManager() {
  const localConfig = getLocalConfig();
  if (!localConfig.pluginPkgManager) {
    const localManagers = await getLocalManagers();
    // pnpm first
    const pkgManager = localManagers.includes('pnpm') ? 'pnpm' : localManagers[0];
    localConfig.pluginPkgManager = pkgManager;
    await setLocalConfigAsync();
  }
}
