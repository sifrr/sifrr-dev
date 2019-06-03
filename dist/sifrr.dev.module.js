/*! sifrr.dev v0.0.1-rc2 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */
import fs$1 from 'fs';
import path$1 from 'path';
import rollupPluginBabel from 'rollup-plugin-babel';
import rollupPluginTerser from 'rollup-plugin-terser';
import rollupPluginNodeResolve from 'rollup-plugin-node-resolve';
import rollupPluginCommonjs from 'rollup-plugin-commonjs';
import rollupPluginCleanup from 'rollup-plugin-cleanup';
import conventionalChangelog from 'conventional-changelog';
import child_process from 'child_process';
import mocha from 'mocha';
import istanbulLibInstrument from 'istanbul-lib-instrument';
import server$1 from '@sifrr/server';
import chai$1 from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import inspector from 'inspector';
import istanbulLibHook from 'istanbul-lib-hook';

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
    delay: false,
    port: false,
    PATH: false,
    SPATH: false,
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
  if (!fs$1.existsSync(dir) || !fs$1.statSync(dir).isDirectory()) return false;
  fs$1.readdirSync(dir).forEach(file => {
    const filePath = path$1.join(dir, file);
    fs$1.statSync(filePath).isDirectory()
      ? (deep > 0 ? (onDir(filePath), loadDir({ dir: filePath, onFile, onDir, deep: deep - 1})) : () => {})
      : onFile(filePath);
  });
  return true;
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
  const filename = path$1.basename(inputFile).slice(0, path$1.basename(inputFile).lastIndexOf('.')).toLowerCase();
  const format = type === 'cjs' ? 'cjs' : (type === 'browser' ? 'umd' : 'es');
  const ret = {
    input: inputFile,
    output: {
      file: path$1.join(outputFolder, `./${(outputFileName || filename) + (type === 'module' ? '.module' : '') + (minify ? '.min' : '')}.js`),
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
  changelogFile = path$1.join(folder, './CHANGELOG.md'),
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
      path: path$1.join(folder, './package.json'),
    },
    preset: 'angular',
    releaseCount,
    outputUnreleased,
    gitRawCommitsOpts: {
      path: folder
    },
    transform
  };
  if (fs$1.existsSync(changelogFile)) {
    if (releaseCount === 0) fs$1.writeFileSync(changelogFile, '');
    oldChangelog = fs$1.readFileSync(changelogFile, 'utf-8');
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
      .pipe(fs$1.createWriteStream(changelogFile))
      .on('error', rej)
      .on('finish', () => {
        fs$1.appendFileSync(changelogFile, oldChangelog);
        res(changelogFile);
      });
  });
};

const spawn = child_process.spawn;
const execa = child_process.exec;
function exec(command, options = {}) {
  process.stdout.write(`Running command: ${command} \n`);
  if (command.indexOf('sh ') === 0) {
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

async function checkTag(version, prefix = 'v') {
  version = version || commonjsRequire(path$1.resolve('./package.json')).version;
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

async function releaseTag(version, prefix = 'v') {
  version = version || commonjsRequire(path$1.resolve('./package.json')).version;
  const tag = prefix + version;
  const exists = await checktag(version, prefix);
  if (!exists) {
    await exec_1(`git tag -a ${tag} -m "Release of ${tag}"`);
    process.stdout.write('\n');
    await exec_1(`git push origin ${tag}`);
    return true;
  } else {
    return false;
  }
}
var releasetag = releaseTag;

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

const instrumenter = istanbulLibInstrument.createInstrumenter();
const { App, SSLApp } = server$1;
function staticInstrument(app, folder, coverage = false) {
  loaddir(folder, {
    onFile: (filePath) => {
      if (coverage && path$1.slice(-3) === '.js') {
        app.get('/' + path$1.relative(folder, filePath), (res) => {
          const text = fs$1.readFileSync(filePath, 'utf-8');
          if (fs$1.existsSync(path$1 + '.map')) {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.send(instrumenter.instrumentSync(text, path$1, JSON.parse(fs$1.readFileSync(path$1 + '.map'))));
          } else {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.send(text);
          }
        });
      } else {
        app.file('/' + path$1.relative(folder, filePath), filePath);
      }
    }
  });
}
var server = async function(root, {
  extraStaticFolders = [],
  setGlobals = true,
  coverage = true,
  port = false,
  securePort = false
} = {}) {
  const listeners = [];
  function startServer(app, hostingPort) {
    staticInstrument(app, root, coverage);
    staticInstrument(app, path$1.join(root, '../../dist'), coverage);
    extraStaticFolders.forEach(folder => {
      staticInstrument(app, folder, coverage);
    });
    listeners.push(() => {
      app.listen(hostingPort, (socket) => {
        if (socket) {
          commonjsGlobal.console.log(`Test server listening on port ${hostingPort}, serving ${hostingPort}`);
        } else {
          commonjsGlobal.console.log('Test server failed to listen to port ' + hostingPort);
        }
      });
    });
  }
  let normalApp, secureApp;
  if (setGlobals && port) {
    commonjsGlobal.PATH = `http://localhost:${port}`;
    commonjsGlobal.port = port;
  }
  if (port) {
    let app;
    if (fs$1.existsSync(path$1.join(root, 'server.js'))) {
      app = commonjsRequire(path$1.join(root, 'server.js'));
    } else {
      app = new App();
      startServer(app, port);
    }
    normalApp = app;
  }
  if (setGlobals && securePort) {
    commonjsGlobal.SPATH = `https://localhost:${securePort}`;
    commonjsGlobal.securePort = securePort;
  }
  if (securePort) {
    let app;
    if (fs$1.existsSync(path$1.join(root, 'secureserver.js'))) {
      app = commonjsRequire(path$1.join(root, 'secureserver.js'));
    } else {
      app = new SSLApp({
        key_file_name: path$1.join(__dirname, 'keys/server.key'),
        cert_file_name: path$1.join(__dirname, 'keys/server.crt')
      });
      startServer(app, securePort);
    }
    secureApp = app;
  }
  return {
    secureApp: secureApp,
    app: normalApp,
    listen: () => {
      listeners.forEach(l => l());
    },
    close: () => {
      secureApp && secureApp.close && secureApp.close();
      normalApp && normalApp.close && normalApp.close();
    }
  };
};

var testglobals = () => {
  commonjsGlobal.ENV = process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  commonjsGlobal.Mocha = mocha;
  commonjsGlobal.chai = chai$1;
  commonjsGlobal.sinon = commonjsGlobal.sinon || sinon.createSandbox();
  commonjsGlobal.assert = chai.assert;
  commonjsGlobal.expect = chai.expect;
  commonjsGlobal.should = chai.should();
  commonjsGlobal.delay = (time) => {
    return new Promise(res => {
      setTimeout(function(){
        res();
      }, time * 1000);
    });
  };
  chai.use(chaiAsPromised);
};

var _0777 = parseInt('0777', 8);
var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs$1;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    var cb = f || function () {};
    p = path$1.resolve(p);
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path$1.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;
            default:
                xfs.stat(p, function (er2, stat) {
                    if (er2 || !stat.isDirectory()) cb(er, made);
                    else cb(null, made);
                });
                break;
        }
    });
}
mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs$1;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    p = path$1.resolve(p);
    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path$1.dirname(p), opts, made);
                sync(p, opts, made);
                break;
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }
    return made;
};

var writecoverage = function writeCoverage(coverage, file) {
  mkdirp.sync(path.dirname(file), (err) => {
    if (err) throw err;
  });
  const contents = JSON.stringify(coverage || {});
  if (contents !== '{}') {
    fs.writeFileSync(file, contents, err => {
      if(err) throw err;
    });
  }
};

function loadTests(dir, mocha, regex, filters) {
  loaddir({
    dir: dir,
    onFile: (filePath) => {
      if (filters.map(bf => filePath.indexOf(bf) >= 0).indexOf(true) >= 0) {
        if (filePath.match(regex)) mocha.addFile(filePath);
      }
    }
  });
}
var run = async function({
  root = path$1.resolve('./'),
  serverOnly = false,
  runUnitTests = true,
  runBrowserTests = true,
  coverage = false,
  setGlobals = true,
  testFileRegex = /\.test\.js$/,
  filters = [''],
  folders = {},
  preCommand = [],
  port = 8888,
  securePort = false,
  useJunitReporter = false,
  junitXmlFile = path$1.resolve(`./test-results/${path$1.basename(root)}/results.xml`),
  inspect = false
} = {}) {
  if (inspect) inspector.open(undefined, undefined, true);
  deepmerge(folders, {
    unitTest: path$1.resolve('./test/unit'),
    browserTest: path$1.resolve('./test/browser'),
    public: path$1.resolve('./test/public'),
    static: []
  }, true);
  if (Array.isArray(preCommand)) {
    for (let i = 0; i < preCommand.length; i++) {
      await exec_1(preCommand[i]).catch(commonjsGlobal.console.error);
    }
  } else {
    await exec_1(preCommand).catch(commonjsGlobal.console.error);
  }
  const servers = await server(folders.public, {
    extraStaticFolders: folders.static,
    setGlobals,
    coverage,
    port,
    securePort
  });
  if (serverOnly) return;
  if (setGlobals) testglobals();
  if (coverage) {
    const { createInstrumenter } = istanbulLibInstrument;
    const instrumenter = createInstrumenter();
    const { hookRequire } = istanbulLibHook;
    hookRequire((filePath) => filePath.match(/\/src/), (code, { filename }) => instrumenter.instrumentSync(code, filename));
  }
  const mochaOptions = {
    timeout: 10000
  };
  if (useJunitReporter) {
    mochaOptions.reporter = 'mocha-junit-reporter';
    mochaOptions.reporterOptions = {
      mochaFile: junitXmlFile
    };
  }
  const mocha$1 = new mocha(mochaOptions);
  if (runBrowserTests || !runUnitTests) {
    servers.listen();
    loadTests(folders.browserTest, mocha$1, testFileRegex, filters);
  }
  if (runUnitTests || !runBrowserTests) {
    loadTests(folders.unitTest, mocha$1, testFileRegex, filters);
  }
  mocha$1.run(async (failures) => {
    servers.close();
    if (failures) {
      process.stdout.write(`---------- ${failures} FAILURES. ----------\n`);
      process.exitCode = 1;
    }
    if (commonjsGlobal.browser) await browser.close();
    if (coverage) {
      writecoverage(commonjsGlobal.__coverage__, path$1.join(root, './.nyc_output', `./${Date.now()}-unit-coverage.json`));
    }
    process.exit(process.exitCode);
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
  releaseTag: releasetag,
  gitAddCommitPush: gitaddcommitpush,
  runTests: run
};
var sifrr_dev_1 = sifrr_dev.eslintrc;
var sifrr_dev_2 = sifrr_dev.loadDir;
var sifrr_dev_3 = sifrr_dev.deepMerge;
var sifrr_dev_4 = sifrr_dev.getRollupConfig;
var sifrr_dev_5 = sifrr_dev.generateChangelog;
var sifrr_dev_6 = sifrr_dev.exec;
var sifrr_dev_7 = sifrr_dev.checkTag;
var sifrr_dev_8 = sifrr_dev.releaseTag;
var sifrr_dev_9 = sifrr_dev.gitAddCommitPush;
var sifrr_dev_10 = sifrr_dev.runTests;

export default sifrr_dev;
export { sifrr_dev_7 as checkTag, sifrr_dev_3 as deepMerge, sifrr_dev_1 as eslintrc, sifrr_dev_6 as exec, sifrr_dev_5 as generateChangelog, sifrr_dev_4 as getRollupConfig, sifrr_dev_9 as gitAddCommitPush, sifrr_dev_2 as loadDir, sifrr_dev_8 as releaseTag, sifrr_dev_10 as runTests };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.module.js.map
