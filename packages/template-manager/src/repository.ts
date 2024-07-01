import { basename, resolve } from 'path';
import { existsSync } from 'fs';

import chalk from 'chalk';
import type { SimpleGit } from 'simple-git';
import { simpleGit } from 'simple-git';
import { oraPromise } from 'ora';
import { PACKAGES_RIR, isDev, isRemotePath } from '@ldk/shared';

import { DEFAULT_BRANCH, isOfficialTemp } from './constant.js';

import type { TemplateConfig } from './index.js';

export async function cloneRepo(config: TemplateConfig) {
  const { url, local, branch } = config;
  const git = simpleGit();
  await git.clone(url, local, ['--single-branch', '--branch', branch]);
  await getLatestCommitId(simpleGit(local), config);
}
export async function cloneRepoWithOra(config: TemplateConfig) {
  try {
    await oraPromise(cloneRepo(config), {
      successText: `Repository cloned successfully`,
      failText: `Failed to clone repository`,
      text: 'Loading clone',
    });
  } catch (error) {
    console.error(chalk.bgRed('ERROR') + chalk.red(' Failed to clone repository:'), error);
    throw error;
  }
}

// 暂未使用
let tempId = 0;
export function getRepoDirName(repoUrl: string) {
  if (!isRemotePath(repoUrl)) {
    return basename(repoUrl);
  }
  const [, searchStr] = repoUrl.split('?');
  if (searchStr) {
    const searchParams = new URLSearchParams(searchStr);
    repoUrl = searchParams.get('temp') || repoUrl;
  }
  const base = basename(repoUrl);
  const [localName] = base.split('#');
  if (localName) {
    return localName;
  }
  return `cli-tempalate-${tempId++}`;
}

// https://github.com/Devil-Training-Camp/ldk-cli?temp=packages/cli-template-base#main
export function formatRepoUrl(repoUrl: string) {
  if (isDev() && isOfficialTemp(repoUrl)) {
    return resolve(PACKAGES_RIR, repoUrl);
  }
  if (existsSync(repoUrl)) return resolve(repoUrl);
  if (!isRemotePath(repoUrl)) {
    repoUrl = 'https://github.com/' + repoUrl;
  }
  if (repoUrl.includes('.git')) {
    repoUrl = repoUrl.replace('.git', '');
  }
  // branch
  if (!repoUrl.includes('#')) {
    repoUrl += `#${DEFAULT_BRANCH}`;
  }
  repoUrl = repoUrl.replace(/\/([?#&])/g, '$1').replace(/\/$/, '');
  return repoUrl;
}

export function parseRepoUrl(repoUrl: string) {
  if (!isRemotePath(repoUrl)) {
    return {
      branch: '',
      temp: '',
      url: '',
      title: basename(repoUrl),
    };
  }
  const url = new URL(repoUrl);
  const branch = url.hash.slice(1);
  const temp = url.searchParams.get('temp') || '';
  const title = `${basename(temp || url.pathname)}${DEFAULT_BRANCH === branch ? '' : `(${branch})`}`;

  return {
    branch,
    temp,
    url: url.origin + url.pathname,
    title,
  };
}

export async function getLatestCommitId(git: SimpleGit, config: TemplateConfig) {
  const { branch, temp } = config;
  try {
    await git.fetch('origin', branch);
    // 拿分支 commitId
    const logParams = [`origin/${branch}`];
    if (temp) {
      logParams.push.apply(logParams, ['--', temp]);
    }
    const log = await git.log(logParams);
    const latestCommit = log.latest?.hash || '';
    config.version = latestCommit;
    return latestCommit;
  } catch (err) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to get repository version: '), err);
  }
  return '';
}
export async function checkRepoVersion(git: SimpleGit, config: TemplateConfig) {
  const latestCommitId = config.version;
  const latestRemoteCommitId = await getLatestCommitId(git, config);
  // console.log(latestCommitId, latestRemoteCommitId);
  return latestCommitId === latestRemoteCommitId;
}
export async function updateRepo(config: TemplateConfig, force = false) {
  const { local, path } = config;
  const git = simpleGit(local);
  if (force) {
    // checkout 不仅可以切换/创建分支，还可以重置文件到 HEAD
    await git.checkout('HEAD', [path]);
    await getLatestCommitId(git, config);
  } else if (await checkRepoVersion(git, config)) {
    return;
  }
  await git.pull();
}
export async function updateRepoWithOra(config: TemplateConfig, force = false) {
  try {
    await oraPromise(updateRepo(config, force), {
      successText: `Repository updated successfully`,
      failText: `Failed to update repository`,
      text: 'Loading update',
    });
  } catch (err) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to update repository: '), err);
  }
}
