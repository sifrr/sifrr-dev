/*! sifrr.dev v0.0.1-dev - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */
import fs from 'fs';
import path from 'path';
import rollupPluginBabel from 'rollup-plugin-babel';
import rollupPluginTerser from 'rollup-plugin-terser';
import rollupPluginNodeResolve from 'rollup-plugin-node-resolve';
import rollupPluginCommonjs from 'rollup-plugin-commonjs';
import rollupPluginCleanup from 'rollup-plugin-cleanup';

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

function loadDir(dir, onFile, deep = 100) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory()
      ? (deep > 0 ? loadDir(filePath, onFile, deep - 1) : () => {})
      : onFile(filePath);
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
      target[k] = deepMerge(target[k], merger[k]);
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
  const format = type === 'cjs' ? 'cjs' : (type === 'browser' ? 'umd' : 'es');
  const ret = {
    input: inputFile,
    output: {
      file: path.join(outputFolder, `./${(outputFileName || filename) + (type === 'module' ? '.module' : '') + (minify ? '.min' : '')}.js`),
      format,
      name: name,
      sourcemap: !minify,
      preferConst: true,
      exports: 'named'
    },
    plugins: [
      rollupPluginNodeResolve({
        browser: type === 'browser',
        mainFields: ['module', 'main']
      }),
      rollupPluginCommonjs()
    ]
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

export default sifrr_dev;
export { sifrr_dev_3 as deepMerge, sifrr_dev_1 as eslintrc, sifrr_dev_4 as getRollupConfig, sifrr_dev_2 as loadDir };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.module.js.map
