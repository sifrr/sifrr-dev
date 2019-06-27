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
  { name, inputFile, outputFolder, minify = false, type = 'cjs', outputFileName },
  extraConfig = {}
) {
  const filename = path
    .basename(inputFile)
    .slice(0, path.basename(inputFile).lastIndexOf('.'))
    .toLowerCase();
  type = Array.isArray(type) ? type : [type];
  const output = type.map(t => {
    const format = t === 'cjs' ? 'cjs' : t === 'browser' ? 'umd' : 'es';
    return {
      file: path.join(
        outputFolder,
        `./${outputFileName || filename}${
          format === 'es' ? '.module' : format === 'cjs' ? '.cjs' : ''
        }${minify ? '.min' : ''}.js`
      ),
      format,
      name,
      sourcemap: !minify,
      preferConst: true,
      exports: 'named',
      ...extraConfig.output
    };
  });
  const ret = {
    input: inputFile,
    output: output.length === 0 ? output[0] : output,
    external: Object.keys(require(path.resolve('./package.json')).dependencies),
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
      }),
      cleanup(),
      babel({
        exclude: 'node_modules/**',
        rootMode: 'upward'
      })
    ]
  };

  if (minify) {
    ret.plugins.push(
      terser({
        output: {
          comments: 'all'
        }
      })
    );
  }

  delete extraConfig.output;
  return deepMerge(ret, extraConfig, true);
}

module.exports = moduleConfig;
