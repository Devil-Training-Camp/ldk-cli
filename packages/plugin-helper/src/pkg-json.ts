import chalk from 'chalk';

export type PkgJson = {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
};
type InjectOption = {
  replace: boolean;
};
const defaultInjectOption: InjectOption = {
  replace: false,
};
export function injectJsonAttr<T extends keyof PkgJson, K extends PkgJson[T]>(
  json: Partial<PkgJson>,
  key: T,
  value: K,
  option?: InjectOption,
) {
  option = {
    ...defaultInjectOption,
    ...option,
  };
  if (option.replace) {
    json[key] = value;
    return json;
  }
  if (typeof value === 'string') {
    json[key] = value;
    return json;
  }
  const oldValue = json[key as 'dependencies'];
  json[key as 'dependencies'] = {
    ...oldValue,
    ...value,
  };
  return json;
}
export function injectDependencies(
  json: Partial<PkgJson>,
  records: Record<string, string>,
  replace = false,
) {
  return injectJsonAttr(json, 'dependencies', records, { replace });
}
export function injectDevDependencies(
  json: Partial<PkgJson>,
  records: Record<string, string>,
  replace = false,
) {
  return injectJsonAttr(json, 'devDependencies', records, { replace });
}
export function injectScripts(
  json: Partial<PkgJson>,
  records: Record<string, string>,
  replace = false,
) {
  return injectJsonAttr(json, 'scripts', records, { replace });
}
export function injectName(json: Partial<PkgJson>, name: string) {
  return injectJsonAttr(json, 'name', name);
}
export function tryStringify(json: Partial<PkgJson>) {
  try {
    return JSON.stringify(json, null, 2);
  } catch (error) {
    console.error(chalk.bgRed('ERROR') + chalk.red(` Parse ${json} to string Failed`));
  }
  return '';
}
export function tryParse(code: string) {
  try {
    return JSON.parse(code) as Partial<PkgJson>;
  } catch (error) {
    console.error(chalk.bgRed('ERROR') + chalk.red(` Parse ${code} to JSON Failed`));
  }
  return {};
}
export function parseJson(code: string | Partial<PkgJson>) {
  let json = code as Partial<PkgJson>;
  if (typeof code === 'string') {
    json = tryParse(code);
  }

  return {
    injectDependencies: injectDependencies.bind(null, json),
    injectDevDependencies: injectDevDependencies.bind(null, json),
    injectName: injectName.bind(null, json),
    injectScripts: injectScripts.bind(null, json),
    tryStringify: tryStringify.bind(null, json),
    json,
  };
}
