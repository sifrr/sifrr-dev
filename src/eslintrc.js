module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true
  },
  // for tests
  globals: {
    ENV: true,
    chai: false,
    sinon: false,
    assert: false,
    expect: false,
    should: false,
    delay: false,
    port: false,
    PATH: false,
    SPATH: false,
    page: false,
    browser: false
  },
  extends: 'eslint:recommended',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
    esversion: 2017
  },
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    semi: [
      'warn',
      'always'
    ],
    'quote-props': [
      'error',
      'as-needed'
    ],
    'no-var': [
      'error'
    ],
    'max-lines': [
      'error',
      220
    ],
    'mocha/no-exclusive-tests': 'error'
  },
  plugins: [
    'html',
    'mocha'
  ],
  settings: {
    'html/indent': '+2'
  }
};
