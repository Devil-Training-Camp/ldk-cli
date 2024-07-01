import { join } from 'path';

import { CACHE_DIR } from '@ldk/shared';

export const OFFICIAL_TEMPLATES = ['cli-template-base', 'cli'];
export function isOfficialTemp(name: string) {
  return OFFICIAL_TEMPLATES.includes(name);
}
export const DEFAULT_BRANCH = 'main';
export const TEMPLATE_IGNORE_DIRS = ['.git', 'node_modules'];
export const TEMPLATE_IGNORE_DIRS_RE = new RegExp(`(\\/|\\\\)(${TEMPLATE_IGNORE_DIRS.join('|')})`);
export const TEMPLATE_CACHE_DIR = join(CACHE_DIR, 'templates');
