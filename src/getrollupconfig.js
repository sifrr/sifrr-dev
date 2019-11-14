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
const replace = require('rollup-plugin-replace');

const deepMerge = require('./deepmerge');

function moduleConfig(
  {
    root = path.cwd(),
    name,
    inputFile,
    outputFolder,
    minify = false,
    type = 'cjs',
    outputFileName,
    replaceEnv = true
  },
  extraConfig = {},
  mergeArrays = true
) {
  const filename = path
    .basename(inputFile)
    .slice(0, path.basename(inputFile).lastIndexOf('.'))
    .toLowerCase();
  const tsconfig = path.join(root, 'tsconfig.json');

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
    output: output.length === 1 ? output[0] : output,
    plugins: [
      resolve({
        browser: type === 'browser',
        mainFields: ['module', 'main']
      }),
      fs.existsSync(tsconfig)
        ? typescript({
            typescript: require('typescript'),
            useTsconfigDeclarationDir: true,
            cacheRoot: './.ts_cache',
            tsconfig,
            tsconfigOverride: {
              compilerOptions: {
                sourceMap: true
              }
            }
          })
        : false,
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
        exclude: 'node_modules/**',
        rootMode: 'upward'
      }),
      replaceEnv
        ? replace({
            ENVIRONMENT: JSON.stringify(process.env.NODE_ENV || process.env.ENV || 'development'),
            'global.IS_NODE': JSON.stringify(type[0] === 'cjs'),
            'global.IS_MODULE': JSON.stringify(type[0] === 'module'),
            'global.IS_BROWSER': JSON.stringify(type[0] === 'browser')
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
  return deepMerge(ret, extraConfig, mergeArrays);
}

module.exports = moduleConfig;
