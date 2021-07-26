module.exports = {
  env: {
    es6: true,
    // es8: true,
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {
      // ecmaVersion: 8,
      experimentalObjectRestSpread: true,
    },
    sourceType: 'module',
  },
  // extends: 'eslint:recommended',
  rules: {
    eqeqeq: 'off',
    curly: 'error',
    quotes: ['error', 'single'],
    'no-var': 2,
    'prefer-const': 'error',
  },
};
