import { readFile } from 'fs/promises';

import axios from 'axios';
import { glob } from 'glob';

async function sync() {
  const paths = await glob(`packages/*/package.json`, {
    nodir: true,
    absolute: true,
  });
  const pkgNames = await Promise.all(
    paths.map(async path => {
      const code = await readFile(path, { encoding: 'utf8' });
      const pkg = JSON.parse(code);
      return pkg.name;
    }),
  );
  for (const pkgName of pkgNames) {
    try {
      const encodedPkgName = encodeURIComponent(pkgName);
      const response = await axios.post(
        `https://npmmirror.com/sync/${encodedPkgName}?sync_upstream=true`,
      );
      console.log(`Synced ${pkgName}: ${response.status}`);
    } catch (error) {
      console.error(`Failed to sync ${pkgName}: `, error);
    }
  }
}
sync();
