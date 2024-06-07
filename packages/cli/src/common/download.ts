import { simpleGit } from 'simple-git';
export async function cloneRepo(repoUrl: string, localPath: string) {
  const git = simpleGit();
  await git.clone(repoUrl, localPath);
}
