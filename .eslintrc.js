module.exports = {
  "extends": ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "plugin:jest/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "jest"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/prefer-to-contain": "warn"
  }
};
