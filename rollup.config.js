const path = require('path');

const getRollupConfig = require('./src/getrollupconfig');
const footer = '/*! (c) @aadityataparia */';

function moduleConfig(name, root, minify = false, isModule = false) {
  const banner = `/*! ${name} v${require('./package.json').version} - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */`;
  return getRollupConfig({
    name,
    inputFile: path.join(root, `./src/sifrr.dev.js`),
    outputFolder: path.join(root, './dist'),
    minify,
    type: isModule ? 'module' : 'cjs'
  }, {
    output: {
      banner,
      footer,
      exports: 'named'
    },
    external: id => {
      const packages = [
        'fs',
        'path',
        'inspector',
        '@sifrr/server',
        'conventional-changelog',
        'child_process',
        'puppeteer',
        'mocha',
        'sinon',
        'chai',
        'chai-as-promised',
        'autoprefixer',
        'cssnano',
        'portfinder',
        'json-fn',
        'crypto'
      ];
      if (packages.indexOf(id) > -1) return true;
      if (id.indexOf('rollup-plugin') === 0) return true;
      if (id.indexOf('istanbul') === 0) return true;
      return false;
    }
  });
}

module.exports = [
  moduleConfig('sifrr.dev', __dirname),
  moduleConfig('sifrr.dev', __dirname, true),
  moduleConfig('sifrr.dev', __dirname, false, true)
];
