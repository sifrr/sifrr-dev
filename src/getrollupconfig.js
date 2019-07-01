const path = require('path');
const fs = require('fs');
const babel = require('rollup-plugin-babel');
const terser = require('rollup-plugin-terser').terser;
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');
const postcss = require('rollup-plugin-postcss');
const html = require('rollup-plugin-html');
const typescript = require('rollup-plugin-typescript2');

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
    const format = t === 'cjs' ? 'cjs' : t === 'browser' ? 'iife' : 'es';
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
      ...extraConfig.output
    };
  });
  const ret = {
    input: inputFile,
    output: output.length === 0 ? output[0] : output,
    external: Object.keys(require(path.resolve('./package.json')).dependencies || []).concat(),
    plugins: [
      resolve({
        browser: type === 'browser',
        mainFields: ['module', 'main']
      }),
      fs.existsSync(path.resolve('tsconfig.json'))
        ? typescript({
            typescript: require('typescript'),
            declarationDir: 'dist/type',
            cacheRoot: './.ts_cache'
          })
        : false,
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
      }),
      minify
        ? terser({
            output: {
              comments: 'all'
            }
          })
        : false
    ].filter(p => p)
  };

  delete extraConfig.output;
  return deepMerge(ret, extraConfig, true);
}

module.exports = moduleConfig;
