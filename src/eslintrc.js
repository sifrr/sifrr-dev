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
    fs: false,
    path: false,
    chai: false,
    sinon: false,
    assert: false,
    expect: false,
    should: false,
    window: false,
    delay: false,
    puppeteer: false,
    server: false,
    port: false,
    PATH: false,
    page: false,
    browser: false,
    Sifrr: false,
    SifrrStorage: false
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
      220 // Change to 200 after refactoring API.Model
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
