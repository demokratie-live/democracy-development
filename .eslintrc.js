module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: `./tsconfig.json`,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-empty-object-type': 0,
    '@typescript-eslint/no-require-imports': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-unsafe-declaration-merging': 0,
    '@typescript-eslint/no-unsafe-function-type': 0,
    // '@typescript-eslint/no-unnecessary-condition': ['error'],
  },
  overrides: [
    {
      "files": ["**/*/*.test.ts"],
      "env": {
        "jest": true
      }
    }
  ],
};
