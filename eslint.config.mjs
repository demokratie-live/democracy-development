import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    plugins: ['@typescript-eslint', 'jest'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:jest/recommended'],
    parser: '@typescript-eslint/parser',
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/prefer-to-contain': 'warn',
    },
  },
];
