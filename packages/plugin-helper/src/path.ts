import { normalize } from 'path';

export function pathMatcher(subPaths: string[], path: string) {
  path = normalize(path);
  return subPaths.some(subPath => {
    subPath = normalize(subPath);
    return path.includes(subPath);
  });
}
