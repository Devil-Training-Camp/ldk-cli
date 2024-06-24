import { join } from 'path';

import { CACHE_DIR } from '@ldk/shared';
// 重复性测试 规范名称测试
export const OFFICIAL_TEMPLATES = [
  'https://github.com/grey-coat/virtual-scroll-list-liudingkang-test.git',
  'https://github.com/grey-coat/virtual-scroll-list-liudingkang-build-test',
  'https://github.com/Devil-Training-Camp/ldk-cli/?temp=packages/cli-template-base/#main',
  'https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli#main',
  'https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli#main',
];
export const DEFAULT_BRANCH = 'main';
export const TEMPLATE_IGNORE_DIRS = ['.git'];
export const TEMPLATE_IGNORE_DIRS_RE = new RegExp(`(\\/|\\\\)(${TEMPLATE_IGNORE_DIRS.join('|')})`);
export const TEMPLATE_CACHE_DIR = join(CACHE_DIR, 'templates');
