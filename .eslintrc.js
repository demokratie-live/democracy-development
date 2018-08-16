module.exports = {
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": ["error"],
    "newline-per-chained-call": [2],
    'linebreak-style': 0,
  },
  globals: {
    Log: true,
  },
};
