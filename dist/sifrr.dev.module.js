/*! sifrr.dev v0.0.1-rc2 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */
import fs from 'fs';
import path from 'path';
import rollupPluginBabel from 'rollup-plugin-babel';
import rollupPluginTerser from 'rollup-plugin-terser';
import rollupPluginNodeResolve from 'rollup-plugin-node-resolve';
import rollupPluginCommonjs from 'rollup-plugin-commonjs';
import rollupPluginCleanup from 'rollup-plugin-cleanup';
import conventionalChangelog from 'conventional-changelog';
import child_process from 'child_process';

var eslintrc = {
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true
  },
  globals: {
    ENV: true,
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
    browser: false
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

function loadDir({
  dir,
  onFile = () => {},
  onDir = () => {},
  deep = 100
} = {}) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory()
      ? (deep > 0 ? (onDir(filePath), loadDir({ dir: filePath, onFile, onDir, deep: deep - 1})) : () => {})
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

const rtag = /tag:\s*[v=]?(.+?)[,)]/gi;
var generatechangelog = ({
  folder = process.cwd(),
  releaseCount = 0,
  changelogFile = path.join(folder, './CHANGELOG.md'),
  outputUnreleased = false,
  multiRepo = false
} = {}) => {
  let oldChangelog = '';
  const transform = function(cm, cb) {
    let match = rtag.exec(cm.gitTags);
    rtag.lastIndex = 0;
    if (match) cm.version = match[1];
    cb(null, cm);
  };
  const options = {
    pkg: {
      path: path.join(folder, './package.json'),
    },
    preset: 'angular',
    releaseCount,
    outputUnreleased,
    gitRawCommitsOpts: {
      path: folder
    },
    transform
  };
  if (fs.existsSync(changelogFile)) {
    if (releaseCount === 0) fs.writeFileSync(changelogFile, '');
    oldChangelog = fs.readFileSync(changelogFile, 'utf-8');
  }
  if (multiRepo) {
    options.transform = (cm, cb) => {
      if (cm.scope && cm.scope === multiRepo) cm.scope = null;
      else cm.type = 'chore';
      transform(cm, cb);
    };
  }
  return new Promise((res, rej) => {
    conventionalChangelog(options)
      .pipe(fs.createWriteStream(changelogFile))
      .on('error', rej)
      .on('finish', () => {
        fs.appendFileSync(changelogFile, oldChangelog);
        res(changelogFile);
      });
  });
};

const spawn = child_process.spawn;
const execa = child_process.exec;
function exec(command, options = {}) {
  process.stdout.write(`Running command: ${command} \n`);
  if (command.indexOf('sh') === 0) {
    options.stdio = options.stdio || 'inherit';
    return new Promise((res, rej) => {
      const [c, ...args] = command.split(' ');
      const runner = spawn(c, args, options);
      runner.on('close', (code) => {
        if (code !== 0) {
          process.stdout.write(`Command exited with code ${code}: ${command} \n`);
          rej(code);
        } else {
          process.stdout.write(`Finished command: ${command} \n`);
          res();
        }
      });
    });
  } else {
    return new Promise((res, rej) => {
      execa(command, options, (err, stdout, stderr) => {
        if (stdout) process.stdout.write(`out: ${stdout} \n`);
        if (stderr) process.stderr.write(`err: ${stderr} \n`);
        if (err !== null) {
          process.stderr.write(`exec error: ${err}`);
          rej(err);
        }
        res({ stdout, stderr });
        process.stdout.write(`Finished command: ${command} \n`);
      });
    });
  }
}
var exec_1 =  exec;

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

async function checkTag(version, prefix = 'v') {
  version = version || commonjsRequire(path.resolve('./package.json')).version;
  const tag = prefix + version;
  await exec_1('git pull');
  return exec_1(`git rev-parse ${tag}`).then(() => {
    process.stdout.write(`Tag ${tag} already exists.`);
    return true;
  }).catch(async () => {
    return false;
  });
}
var checktag = checkTag;

var gitaddcommitpush = async function({
  preCommand = false,
  files = '*',
  commitMsg = 'chore: add new files',
  push = true
} = {}) {
  if (preCommand) {
    if (Array.isArray(preCommand)) {
      for (let i = 0; i < preCommand.length; i++) {
        await exec_1(preCommand[i]);
      }
    } else {
      await exec_1(preCommand);
    }
  }
  if (Array.isArray(files)) {
    for (let i = 0; i < files.length; i++) {
      await exec_1(`git ls-files '${files[i]}' | xargs git add`);
    }
  } else {
    await exec_1(`git ls-files '${files}' | xargs git add`);
  }
  await exec_1(`git commit -m "${commitMsg}"`).then(() => {
    if (push) exec_1(`git push`);
  }).catch(() => {
    process.stdout.write('Nothing to commit, not running git push. \n');
  });
};

var sifrr_dev = {
  eslintrc: eslintrc,
  loadDir: loaddir,
  deepMerge: deepmerge,
  getRollupConfig: getrollupconfig,
  generateChangelog: generatechangelog,
  exec: exec_1,
  checkTag: checktag,
  gitAddCommitPush: gitaddcommitpush
};
var sifrr_dev_1 = sifrr_dev.eslintrc;
var sifrr_dev_2 = sifrr_dev.loadDir;
var sifrr_dev_3 = sifrr_dev.deepMerge;
var sifrr_dev_4 = sifrr_dev.getRollupConfig;
var sifrr_dev_5 = sifrr_dev.generateChangelog;
var sifrr_dev_6 = sifrr_dev.exec;
var sifrr_dev_7 = sifrr_dev.checkTag;
var sifrr_dev_8 = sifrr_dev.gitAddCommitPush;

export default sifrr_dev;
export { sifrr_dev_7 as checkTag, sifrr_dev_3 as deepMerge, sifrr_dev_1 as eslintrc, sifrr_dev_6 as exec, sifrr_dev_5 as generateChangelog, sifrr_dev_4 as getRollupConfig, sifrr_dev_8 as gitAddCommitPush, sifrr_dev_2 as loadDir };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.module.js.map
