const path = require('path');
const babel = require('rollup-plugin-babel');
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');
const postcss = require('rollup-plugin-postcss');
const html = require('rollup-plugin-html');

const deepMerge = require('./deepmerge');

function moduleConfig(
  {
    name,
    inputFile,
    outputFolder,
    minify = false,
    type = 'cjs',
    outputFileName
  },
  extraConfig
) {
  const filename = path
    .basename(inputFile)
    .slice(0, path.basename(inputFile).lastIndexOf('.'))
    .toLowerCase();
  const format = type === 'cjs' ? 'cjs' : type === 'browser' ? 'umd' : 'es';
  const ret = {
    input: inputFile,
    output: {
      file: path.join(
        outputFolder,
        `./${(outputFileName || filename) +
          (type === 'module' ? '.module' : '') +
          (minify ? '.min' : '')}.js`
      ),
      format,
      name,
      sourcemap: !minify,
      preferConst: true
    },
    plugins: [
      resolve({
        browser: type === 'browser',
        mainFields: ['module', 'main']
      }),
      commonjs(),
      postcss({
        extensions: ['.css', '.scss', '.sass', '.less'],
        inject: false,
        plugins: [
          minify
            ? require('cssnano')({
                preset: ['default']
              })
            : false,
          require('autoprefixer')
        ].filter(k => k)
      }),
      html({
        htmlMinifierOptions: minify
          ? {
              collapseWhitespace: true,
              collapseBooleanAttributes: true,
              conservativeCollapse: true,
              minifyJS: true
            }
          : {}
      })
    ]
  };

  if (type !== 'module') {
    ret.plugins.push(
      babel({
        exclude: 'node_modules/**',
        rootMode: 'upward'
      })
    );
  }

  ret.plugins.push(cleanup());

  if (minify) {
    ret.plugins.push(
      terser({
        output: {
          comments: 'all'
        }
      })
    );
  }

  return deepMerge(ret, extraConfig, true);
}

module.exports = moduleConfig;
