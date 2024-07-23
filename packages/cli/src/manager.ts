import { pkgManagers, type PkgManager } from '@ldk-cli/shared';
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
