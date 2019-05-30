/*! Sifrr.Dev v0.0.1-dev - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-elements */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs'), require('path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'fs', 'path'], factory) :
  (global = global || self, factory((global.Sifrr = global.Sifrr || {}, global.Sifrr.Dev = {}), global.fs, global.path));
}(this, function (exports, fs, path) { 'use strict';

  fs = fs && fs.hasOwnProperty('default') ? fs['default'] : fs;
  path = path && path.hasOwnProperty('default') ? path['default'] : path;

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
      'max-lines': ['error', 220
      ],
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

  var dev = {
    eslintrc: eslintrc,
    loaddir: loaddir
  };
  var dev_1 = dev.eslintrc;
  var dev_2 = dev.loaddir;

  exports.default = dev;
  exports.eslintrc = dev_1;
  exports.loaddir = dev_2;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.js.map
