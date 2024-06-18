import { basename } from 'path';

import chalk from 'chalk';
import type { SimpleGit } from 'simple-git';
import { simpleGit } from 'simple-git';
import { oraPromise } from 'ora';

import type { TemplateConfig } from '../core/template.js';

import { DEFAULT_BRANCH } from './constant.js';

import { isLocalPath, isRemotePath } from './index.js';

export async function cloneRepo(config: TemplateConfig) {
  const { url, local, branch } = config;
  const git = simpleGit();
  console.log(local, 'clone');
  await git.clone(url, local, ['--single-branch', '--branch', branch]);
  const latestRemoteCommitId = await getLatestCommitId(simpleGit(local), config);
  config.version = latestRemoteCommitId;
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
let tempId = 0;
export function getRepoDirName(repoUrl: string) {
  const base = basename(repoUrl);
  const [localName] = base.split('#');
  if (localName) {
    return localName;
  }
  return `cli-tempalate-${tempId++}`;
}

const REPO_NAME_RE = /\/([^/]*)\.git/;
export function formatRepoUrl(repoUrl: string) {
  if (isLocalPath(repoUrl)) return repoUrl;
  if (!isRemotePath(repoUrl)) {
    repoUrl += 'http://github.com/';
  }
  if (REPO_NAME_RE.test(repoUrl)) {
    repoUrl = repoUrl.replace('.git', '');
  }
  // branch
  if (!repoUrl.includes('#')) {
    repoUrl += `#${DEFAULT_BRANCH}`;
  }
  return repoUrl;
}

export function parseRepoUrl(repoUrl: string) {
  const url = new URL(repoUrl);
  const branch = url.hash.slice(1);
  const temp = url.searchParams.get('temp') || '';
  return {
    branch,
    temp,
    url: url.origin + url.pathname,
  };
}

export async function getLatestCommitId(git: SimpleGit, config: TemplateConfig) {
  const { branch, temp } = config;
  try {
    await git.fetch('origin', branch);
    // 拿默认分支 commitId
    const logParams = [`origin/${branch}`];
    if (temp) {
      logParams.push.apply(logParams, ['--', temp]);
    }
    const log = await git.log(logParams);
    const latestCommit = log.latest?.hash || '';
    return latestCommit;
  } catch (err) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to get repository version: '), err);
  }
  return '';
}
export async function checkRepoVersion(git: SimpleGit, config: TemplateConfig) {
  const latestCommitId = config.version;
  const latestRemoteCommitId = await getLatestCommitId(git, config);
  config.version = latestRemoteCommitId;
  console.log(latestCommitId, latestRemoteCommitId);
  return latestCommitId === latestRemoteCommitId;
}
export async function updateRepo(config: TemplateConfig) {
  const { local } = config;
  const git = simpleGit(local);
  if (await checkRepoVersion(git, config)) return;
  await git.pull();
  console.log('pull', config.temp);
}
export async function updateRepoWithOra(config: TemplateConfig) {
  try {
    await oraPromise(updateRepo(config), {
      successText: `Repository updated successfully`,
      failText: `Failed to update repository`,
      text: 'Loading update',
    });
  } catch (err) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to update repository: '), err);
  }
}
