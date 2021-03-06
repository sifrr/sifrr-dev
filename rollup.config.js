const path = require('path');

const getRollupConfig = require('./src/getrollupconfig');
const footer = '/*! (c) @aadityataparia */';

function moduleConfig(name, root, minify = false, type) {
  const banner = `/*! ${name} v${
    require('./package.json').version
  } - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */`;
  return getRollupConfig(
    {
      root,
      name,
      inputFile: path.join(root, `./src/sifrr.dev.js`),
      outputFolder: path.join(root, './dist'),
      minify,
      type,
      replaceEnv: false
    },
    {
      output: {
        banner,
        footer,
        exports: 'named'
      },
      external: ['fs', 'path', 'inspector', 'child_process', 'crypto']
    }
  );
}

module.exports = [
  moduleConfig('sifrr.dev', __dirname, true, 'module'),
  moduleConfig('sifrr.dev', __dirname, false, 'cjs'),
  moduleConfig('sifrr.dev', __dirname, false, 'module')
];
