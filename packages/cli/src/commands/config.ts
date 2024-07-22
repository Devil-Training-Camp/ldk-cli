import { getLocalConfig, setLocalConfigAsync } from '@ldk/shared';

// e.g pnpm c:plugin
// e.g --add @ldk/cli-plugin-eslint
export async function config(key?: string, value?: string) {
  console.log(key, value);
  const localConfig = getLocalConfig();
  if (!key) {
    console.dir(localConfig, { depth: 3 });
    return;
  }
  if (!value) {
    console.dir(localConfig[key]);
    return;
  }
  localConfig[key] = value;
  await setLocalConfigAsync();
}
