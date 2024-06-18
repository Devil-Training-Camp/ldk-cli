import { basename } from 'path';

import chalk from 'chalk';
import { simpleGit } from 'simple-git';
import { oraPromise } from 'ora';

import type { TemplateConfig } from '../core/template.js';

import { DEFAULT_BRANCH } from './constant.js';

import { isLocalPath, isRemotePath } from './index.js';

export async function cloneRepo(config: TemplateConfig) {
  const { url, local, branch } = config;
  const git = simpleGit();
  await git.clone(url, local, ['--single-branch', '--branch', branch]);
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

export async function getLatestCommitId(tempPath: string, isRemote = false) {
  try {
    const git = simpleGit(tempPath);
    if (isRemote) {
      await git.fetch('origin');
    }
    // 拿默认分支 commitId
    const log = await git.log();
    const latestCommit = log.latest?.hash || '';
    return latestCommit;
  } catch (err) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to get repository version: '), err);
  }
  return '';
}
export async function checkRepoVersion(tempPath: string) {
  const latestCommitId = await getLatestCommitId(tempPath);
  const latestRemoteCommitId = await getLatestCommitId(tempPath, true);
  // console.log(latestCommitId, latestRemoteCommitId);
  return latestCommitId === latestRemoteCommitId;
}
export async function updateRepo(tempPath: string) {
  if (await checkRepoVersion(tempPath)) return;
  const git = simpleGit(tempPath);
  await git.pull();
}
export async function updateRepoWithOra(tempPath: string) {
  try {
    await oraPromise(updateRepo(tempPath), {
      successText: `Repository updated successfully`,
      failText: `Failed to update repository`,
      text: 'Loading update',
    });
  } catch (err) {
    console.error(chalk.bgYellow('WARN') + chalk.red(' Failed to update repository: '), err);
  }
}
