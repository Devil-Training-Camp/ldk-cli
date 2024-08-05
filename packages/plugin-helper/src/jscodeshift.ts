import type {
  ASTPath,
  ArrayExpression,
  CallExpression,
  ObjectExpression,
  Property,
} from 'jscodeshift';
import j from 'jscodeshift';

export function parseJs(code: string) {
  const root = j(code);

  return {
    root,
    addImports: function (importStatements: string[]) {
      importStatements.forEach(importStatement => {
        root.find(j.Program).get('body', 0).insertBefore(importStatement);
      });
      return this;
    },
    addExports(exportStatements: string[]) {
      exportStatements.forEach(exportStatement => {
        root.find(j.Program).get('body').push(exportStatement);
      });
      return this;
    },
    getImports() {
      return root
        .find(j.ImportDeclaration)
        .nodes()
        .map(node => j(node).toSource());
    },
    getExports() {
      const exportStatements: string[] = [];
      root.find(j.ExportNamedDeclaration).forEach(path => {
        exportStatements.push(j(path).toSource());
      });
      root.find(j.ExportDefaultDeclaration).forEach(path => {
        exportStatements.push(j(path).toSource());
      });
      root.find(j.ExportAllDeclaration).forEach(path => {
        exportStatements.push(j(path).toSource());
      });
      return exportStatements;
    },
    getCode: function () {
      return root.toSource();
    },
    viteAddPlugins(plugins: string[]) {
      // 查找 defineConfig 调用
      const defineConfigCall = root.find(j.CallExpression, {
        callee: {
          type: 'Identifier',
          name: 'defineConfig',
        },
      });

      // 如果找到 defineConfig 调用
      defineConfigCall.forEach((path: ASTPath<CallExpression>) => {
        let configArg = path.node.arguments[0];

        // 如果 defineConfig 没有参数，添加一个对象参数
        if (!configArg) {
          configArg = j.objectExpression([]);
          path.node.arguments.push(configArg);
        } else if (configArg.type !== 'ObjectExpression') {
          // 如果参数不是对象，抛出错误
          throw new Error('defineConfig 参数必须是一个对象');
        }

        const objectConfigArg = configArg as ObjectExpression;

        // 查找或创建 plugins 属性
        let pluginsProperty = objectConfigArg.properties.find(
          (property): property is Property =>
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.key.name === 'plugins',
        );

        if (!pluginsProperty) {
          pluginsProperty = j.property('init', j.identifier('plugins'), j.arrayExpression([]));
          objectConfigArg.properties.push(pluginsProperty);
        }

        // 添加插件到 plugins 数组
        if (pluginsProperty.value.type === 'ArrayExpression') {
          plugins.forEach(plugin => {
            // 创建插件的字符串字面量
            const pluginAst = j.template.expression([`(${plugin})`]);
            (pluginsProperty!.value as ArrayExpression).elements.push(pluginAst);
          });
        }
      });
      return this;
    },
  };
}
