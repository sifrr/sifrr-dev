/*! sifrr.dev v0.0.1-rc1 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const fs = _interopDefault(require('fs'));
const path = _interopDefault(require('path'));
const rollupPluginBabel = _interopDefault(require('rollup-plugin-babel'));
const rollupPluginTerser = _interopDefault(require('rollup-plugin-terser'));
const rollupPluginNodeResolve = _interopDefault(require('rollup-plugin-node-resolve'));
const rollupPluginCommonjs = _interopDefault(require('rollup-plugin-commonjs'));
const rollupPluginCleanup = _interopDefault(require('rollup-plugin-cleanup'));

var eslintrc = {
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true
  },
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
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    semi: ['warn', 'always'],
    'quote-props': ['error', 'as-needed'],
    'no-var': ['error'],
    'max-lines': ['error', 220],
    'mocha/no-exclusive-tests': 'error'
  },
  plugins: ['html', 'mocha'],
  settings: {
    'html/indent': '+2'
  }
};

function loadDir(dir, onFile, deep = 100) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory() ? deep > 0 ? loadDir(filePath, onFile, deep - 1) : () => {} : onFile(filePath);
  });
}
var loaddir = loadDir;

function type(value) {
  if (value === null) return 'null';
  if (typeof value === 'object') {
    if (Array.isArray(value)) return 'array';
  }
  return typeof value;
}
function deepMerge(target, merger, mergeArray = false) {
  switch (type(target)) {
    case 'array':
      return mergeArray ? [...target, ...merger] : [...merger];
    case 'object':
      Object.keys(merger).forEach(k => {
        target[k] = deepMerge(target[k], merger[k], mergeArray);
      });
      return target;
    default:
      return typeof merger === 'undefined' ? target : merger;
  }
}
var deepmerge = deepMerge;

const terser = rollupPluginTerser.terser;
function moduleConfig({
  name,
  inputFile,
  outputFolder,
  minify = false,
  type = 'cjs',
  outputFileName
}, extraConfig) {
  const filename = path.basename(inputFile).slice(0, path.basename(inputFile).lastIndexOf('.')).toLowerCase();
  const format = type === 'cjs' ? 'cjs' : type === 'browser' ? 'umd' : 'es';
  const ret = {
    input: inputFile,
    output: {
      file: path.join(outputFolder, "./".concat((outputFileName || filename) + (type === 'module' ? '.module' : '') + (minify ? '.min' : ''), ".js")),
      format,
      name: name,
      sourcemap: !minify,
      preferConst: true,
      exports: 'named'
    },
    plugins: [rollupPluginNodeResolve({
      browser: type === 'browser',
      mainFields: ['module', 'main']
    }), rollupPluginCommonjs()]
  };
  if (type !== 'module') {
    ret.plugins.push(rollupPluginBabel({
      exclude: 'node_modules/**',
      rootMode: 'upward'
    }));
  }
  ret.plugins.push(rollupPluginCleanup());
  if (minify) {
    ret.plugins.push(terser({
      output: {
        comments: 'all'
      }
    }));
  }
  return deepmerge(ret, extraConfig, true);
}
var getrollupconfig = moduleConfig;

var sifrr_dev = {
  eslintrc: eslintrc,
  loadDir: loaddir,
  deepMerge: deepmerge,
  getRollupConfig: getrollupconfig
};
var sifrr_dev_1 = sifrr_dev.eslintrc;
var sifrr_dev_2 = sifrr_dev.loadDir;
var sifrr_dev_3 = sifrr_dev.deepMerge;
var sifrr_dev_4 = sifrr_dev.getRollupConfig;

exports.deepMerge = sifrr_dev_3;
exports.default = sifrr_dev;
exports.eslintrc = sifrr_dev_1;
exports.getRollupConfig = sifrr_dev_4;
exports.loadDir = sifrr_dev_2;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.js.map
