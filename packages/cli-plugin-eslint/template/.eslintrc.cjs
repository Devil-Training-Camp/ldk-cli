module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  // 扩展配置文件
  extends: [
    'eslint:recommended', // es
    'plugin:import/recommended',
  ],
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
    'import/namespace': [0],
    'import/no-named-as-default-member': [0], // 当存在命名导出时，提示使用命名导出
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
};
