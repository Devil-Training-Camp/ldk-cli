# @ldk-cli/plugin-helper

Some plugin helper functions of `@ldk-cli/cli`.

## injectPkgJsonAttr

Inject field into package.json.

```ts
export declare function injectPkgJsonAttr<T extends keyof PkgJson, K extends PkgJson[T]>(
  json: Partial<PkgJson>,
  key: T,
  value: K,
  option?: InjectOption,
): Partial<PkgJson>;
```

## injectDependencies

Inject `dependencies` into package.json.

```ts
export declare function injectDependencies(
  json: Partial<PkgJson>,
  records: Record<string, string>,
  replace?: boolean,
): Partial<PkgJson>;
```

## injectDevDependencies

Inject `devDependencies` into package.json.

```ts
export declare function injectDevDependencies(
  json: Partial<PkgJson>,
  records: Record<string, string>,
  replace?: boolean,
): Partial<PkgJson>;
```

## injectScripts

Inject `scripts` into package.json.

```ts
export declare function injectScripts(
  json: Partial<PkgJson>,
  records: Record<string, string>,
  replace?: boolean,
): Partial<PkgJson>;
```

## injectName

Inject `name` into package.json.

```ts
export declare function injectName(json: Partial<PkgJson>, name: string): Partial<PkgJson>;
```

## injectVersion

Inject `version` into package.json.

```ts
export declare function injectVersion(json: Partial<PkgJson>, version: string): Partial<PkgJson>;
```

## tryStringify

Convert objects to JSON.

```ts
export declare function tryStringify(json: Partial<PkgJson>): string;
```

## tryParse

Convert JSON to objects.

```ts
export declare function tryParse(code: string): Partial<PkgJson>;
```

## parseJson

Convert string to JSON and return some operation methods.

```ts
export declare function parseJson(code: string | Partial<PkgJson>): {
  injectDependencies: (
    records: Record<string, string>,
    replace?: boolean | undefined,
  ) => Partial<PkgJson>;
  injectDevDependencies: (
    records: Record<string, string>,
    replace?: boolean | undefined,
  ) => Partial<PkgJson>;
  injectName: (name: string) => Partial<PkgJson>;
  injectVersion: (version: string) => Partial<PkgJson>;
  injectScripts: (
    records: Record<string, string>,
    replace?: boolean | undefined,
  ) => Partial<PkgJson>;
  tryStringify: () => string;
  json: Partial<PkgJson>;
};
```

## pathMatcher

If a part of the `path` can match any of the `subPaths`, return `true`.

```ts
export declare function pathMatcher(subPaths: string[], path: string): boolean;
```

## parseJs

Use [jscodeshift][1] to return some functions.

```ts
export declare function parseJs(code: string): {
  root: import('jscodeshift/src/Collection').Collection<any>;
  // inject import statement
  addImports: (importStatements: string[]) => any;
  // inject export statement
  addExports(exportStatements: string[]): any;
  // get all imports
  getImports(): string[];
  // get all exports
  getExports(): string[];
  // get code string
  getCode: () => string;
  // inject plugins into Vite config file.
  viteAddPlugins(plugins: string[]): any;
};
```

[1]: https://github.com/facebook/jscodeshift
