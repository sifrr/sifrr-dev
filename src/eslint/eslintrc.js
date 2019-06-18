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
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
    esversion: 2017
  },
  extends: ['plugin:prettier/recommended', 'eslint:recommended'],
  plugins: ['mocha'],
  rules: {
    'mocha/no-exclusive-tests': 'error'
  }
};
