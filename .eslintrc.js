/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // maybe one day, enable the following:
    // "plugin:@typescript-eslint/recommended-requiring-type-checking:"
    // "plugin:@typescript-eslint/stylistic-type-checked",
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    project: ['./tsconfig.json', './src/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  settings: { react: { version: 'detect' } },
  plugins: ['@typescript-eslint', 'jsx-a11y', 'import'],
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        distinctGroup: true,
      },
    ],
    // We let TypeScript and Vite handle that
    'import/no-unresolved': 'off',
    'spaced-comment': ['error', 'always'],
    'no-console': 2,
  },
};
