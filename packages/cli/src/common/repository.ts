import { basename } from 'path';

import chalk from 'chalk';
import { simpleGit } from 'simple-git';
import { oraPromise } from 'ora';

export async function cloneRepo(repoUrl: string, localPath: string) {
  const git = simpleGit();
  await git.clone(repoUrl, localPath);
}
export async function cloneRepoWithOra(repoUrl: string, localPath: string) {
  try {
    await oraPromise(cloneRepo(repoUrl, localPath), {
      successText: `Repository cloned successfully`,
      failText: `Failed to clone repository`,
      text: 'Loading clone',
    });
  } catch (error) {
    console.error(chalk.bgRed('ERROR') + chalk.red(' Failed to clone repository:'), error);
    throw error;
  }
}
const REPO_NAME_RE = /\/([^/]*)\.git/;
let tempId = 0;
export function getRepoDirName(repoUrl: string) {
  const remoteName = repoUrl.match(REPO_NAME_RE);
  if (remoteName) {
    return remoteName[1];
  }
  const localName = basename(repoUrl);
  if (localName) {
    return localName;
  }
  return `cli-tempalate-${tempId++}`;
}

export async function getLatestCommitId(tempPath: string, isRemote = false) {
  try {
    const git = simpleGit(tempPath);
    // 拿默认分支 commitId
    const log = await git.log();
    if (isRemote) {
      await git.fetch('origin');
    }
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
