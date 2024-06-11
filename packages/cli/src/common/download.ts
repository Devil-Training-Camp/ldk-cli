import { basename } from 'path';

import { simpleGit } from 'simple-git';
export async function cloneRepo(repoUrl: string, localPath: string) {
  const git = simpleGit();
  await git.clone(repoUrl, localPath);
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
