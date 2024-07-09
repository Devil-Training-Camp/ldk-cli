import jscodeshift from 'jscodeshift';

export function parseJs(code: string) {
  const root = jscodeshift(code);

  return {
    addImports: function (importStatements: string[]) {
      importStatements.forEach(importStatement => {
        root.find(jscodeshift.Program).get('body', 0).insertBefore(importStatement);
      });
      return this;
    },
    addExports: function (exportStatements: string[]) {
      exportStatements.forEach(exportStatement => {
        root.find(jscodeshift.Program).get('body').push(exportStatement);
      });
      return this;
    },
    getImports: function () {
      return root
        .find(jscodeshift.ImportDeclaration)
        .nodes()
        .map(node => jscodeshift(node).toSource());
    },
    getExports: function () {
      const exportStatements: string[] = [];
      root.find(jscodeshift.ExportNamedDeclaration).forEach(path => {
        exportStatements.push(jscodeshift(path).toSource());
      });
      root.find(jscodeshift.ExportDefaultDeclaration).forEach(path => {
        exportStatements.push(jscodeshift(path).toSource());
      });
      root.find(jscodeshift.ExportAllDeclaration).forEach(path => {
        exportStatements.push(jscodeshift(path).toSource());
      });
      return exportStatements;
    },
    getCode: function () {
      return root.toSource();
    },
  };
}
