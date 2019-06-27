const path = require('path');

const getRollupConfig = require('./src/getrollupconfig');
const footer = '/*! (c) @aadityataparia */';

function moduleConfig(name, root, minify = false, isModule = false) {
  const banner = `/*! ${name} v${
    require('./package.json').version
  } - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */`;
  return getRollupConfig(
    {
      name,
      inputFile: path.join(root, `./src/sifrr.dev.js`),
      outputFolder: path.join(root, './dist'),
      minify,
      type: isModule ? 'module' : 'cjs'
    },
    {
      output: {
        banner,
        footer
      },
      external: ['fs', 'path', 'inspector', 'child_process', 'crypto']
    }
  );
}

module.exports = [
  moduleConfig('sifrr.dev', __dirname),
  moduleConfig('sifrr.dev', __dirname, true),
  moduleConfig('sifrr.dev', __dirname, false, true)
];
