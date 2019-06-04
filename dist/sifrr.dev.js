/*! sifrr.dev v0.0.1-rc2 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const fs = _interopDefault(require('fs'));
const path = _interopDefault(require('path'));
const rollupPluginBabel = _interopDefault(require('rollup-plugin-babel'));
const rollupPluginTerser = _interopDefault(require('rollup-plugin-terser'));
const rollupPluginNodeResolve = _interopDefault(require('rollup-plugin-node-resolve'));
const rollupPluginCommonjs = _interopDefault(require('rollup-plugin-commonjs'));
const rollupPluginCleanup = _interopDefault(require('rollup-plugin-cleanup'));
const rollupPluginPostcss = _interopDefault(require('rollup-plugin-postcss'));
const rollupPluginHtml = _interopDefault(require('rollup-plugin-html'));
const cssnano = _interopDefault(require('cssnano'));
const autoprefixer = _interopDefault(require('autoprefixer'));
const conventionalChangelog = _interopDefault(require('conventional-changelog'));
const child_process = _interopDefault(require('child_process'));
const mocha = _interopDefault(require('mocha'));
const istanbulLibInstrument = _interopDefault(require('istanbul-lib-instrument'));
const server$1 = _interopDefault(require('@sifrr/server'));
const chai$1 = _interopDefault(require('chai'));
const sinon = _interopDefault(require('sinon'));
const chaiAsPromised = _interopDefault(require('chai-as-promised'));
const puppeteer = _interopDefault(require('puppeteer'));
const istanbulLibCoverage = _interopDefault(require('istanbul-lib-coverage'));
const istanbulLibSourceMaps = _interopDefault(require('istanbul-lib-source-maps'));
const istanbulApi = _interopDefault(require('istanbul-api'));
const inspector = _interopDefault(require('inspector'));
const istanbulLibHook = _interopDefault(require('istanbul-lib-hook'));

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
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    semi: ['warn', 'always'],
    'quote-props': ['error', 'as-needed'],
    'no-var': ['error'],
    'max-lines': ['error', 220],
    'mocha/no-exclusive-tests': 'error'
  },
  plugins: ['html', 'mocha'],
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
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory() ? deep > 0 ? (onDir(filePath), loadDir({
      dir: filePath,
      onFile,
      onDir,
      deep: deep - 1
    })) : () => {} : onFile(filePath);
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
  const filename = path.basename(inputFile).slice(0, path.basename(inputFile).lastIndexOf('.')).toLowerCase();
  const format = type === 'cjs' ? 'cjs' : type === 'browser' ? 'umd' : 'es';
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
    plugins: [rollupPluginNodeResolve({
      browser: type === 'browser',
      mainFields: ['module', 'main']
    }), rollupPluginCommonjs(), rollupPluginPostcss({
      extensions: ['.css', '.scss', '.sass', '.less'],
      inject: false,
      plugins: [minify ? cssnano({
        preset: ['default']
      }) : false, autoprefixer].filter(k => k)
    }), rollupPluginHtml({
      htmlMinifierOptions: minify ? {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        conservativeCollapse: true,
        minifyJS: true
      } : {}
    })]
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
  const transform = function (cm, cb) {
    let match = rtag.exec(cm.gitTags);
    rtag.lastIndex = 0;
    if (match) cm.version = match[1];
    cb(null, cm);
  };
  const options = {
    pkg: {
      path: path.join(folder, './package.json')
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
      if (cm.scope && cm.scope === multiRepo) cm.scope = null;else cm.type = 'chore';
      transform(cm, cb);
    };
  }
  return new Promise((res, rej) => {
    conventionalChangelog(options).pipe(fs.createWriteStream(changelogFile)).on('error', rej).on('finish', () => {
      fs.appendFileSync(changelogFile, oldChangelog);
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
      runner.on('close', code => {
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
        res({
          stdout,
          stderr
        });
        process.stdout.write(`Finished command: ${command} \n`);
      });
    });
  }
}
var exec_1 = exec;

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

async function releaseTag(version, prefix = 'v') {
  version = version || commonjsRequire(path.resolve('./package.json')).version;
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

var gitaddcommitpush = async function ({
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
const {
  App,
  SSLApp
} = server$1;
function staticInstrument(app, folder, coverage = false) {
  loaddir({
    dir: folder,
    onFile: filePath => {
      if (coverage && filePath.slice(-3) === '.js') {
        app.get('/' + path.relative(folder, filePath), res => {
          res.onAborted(commonjsGlobal.console.log);
          const text = fs.readFileSync(filePath, 'utf-8');
          if (fs.existsSync(filePath + '.map')) {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.end(instrumenter.instrumentSync(text, filePath, JSON.parse(fs.readFileSync(filePath + '.map'))));
          } else {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.end(text);
          }
        });
      } else {
        app.file('/' + path.relative(folder, filePath), filePath);
      }
    }
  });
}
var server = async function (root, {
  extraStaticFolders = [],
  setGlobals = true,
  coverage = true,
  port = false,
  securePort = false
} = {}) {
  const listeners = [];
  function startServer(app, hostingPort) {
    staticInstrument(app, root, coverage);
    staticInstrument(app, path.join(root, '../../dist'), coverage);
    extraStaticFolders.forEach(folder => {
      staticInstrument(app, folder, coverage);
    });
    listeners.push(() => {
      app.listen(hostingPort, socket => {
        if (socket) {
          commonjsGlobal.console.log(`Test server listening on port ${hostingPort}, serving ${root}`);
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
    if (fs.existsSync(path.join(root, 'server.js'))) {
      app = commonjsRequire(path.join(root, 'server.js'));
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
    if (fs.existsSync(path.join(root, 'secureserver.js'))) {
      app = commonjsRequire(path.join(root, 'secureserver.js'));
    } else {
      app = new SSLApp({
        key_file_name: path.join(__dirname, 'keys/server.key'),
        cert_file_name: path.join(__dirname, 'keys/server.crt')
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
  commonjsGlobal.delay = time => {
    return new Promise(res => {
      setTimeout(function () {
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
    var xfs = opts.fs || fs;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    var cb = f || function () {};
    p = path.resolve(p);
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), opts, function (er, made) {
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
    var xfs = opts.fs || fs;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    p = path.resolve(p);
    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
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
  mkdirp.sync(path.dirname(file), err => {
    if (err) throw err;
  });
  const contents = JSON.stringify(coverage || {});
  if (contents !== '{}') {
    fs.writeFileSync(file, contents, err => {
      if (err) throw err;
    });
  }
};

var loadbrowser = async function (root, coverage, nycReport = path.join(root, './.nyc_output')) {
  if (commonjsGlobal.browser) await commonjsGlobal.browser.close();
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS !== 'false',
    devtools: false
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 800
  });
  function setPageGoto(page) {
    page.goto = async (url, options) => {
      const jsCoverage = await page.evaluate(() => window.__coverage__);
      writecoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
      const ret = page.mainFrame().goto(url, options);
      return ret;
    };
  }
  if (coverage) {
    browser.__newPage = browser.newPage;
    browser.newPage = async () => {
      const p = await browser.__newPage();
      setPageGoto(p);
    };
    browser.__close = browser.close;
    browser.close = async () => {
      const jsCoverage = await page.evaluate(() => window.__coverage__);
      writecoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
      return browser.__close();
    };
    setPageGoto(page);
  }
  commonjsGlobal.browser = browser;
  commonjsGlobal.page = page;
  return {
    browser,
    page
  };
};

const {
  createInstrumenter
} = istanbulLibInstrument,
      reporter = istanbulApi.createReporter();
let map = istanbulLibCoverage.createCoverageMap();
const instrumenter$1 = createInstrumenter();
const sm = istanbulLibSourceMaps.createSourceMapStore({});
var transformcoverage = function (nycReport, srcFolder, srcFileRegex, reporters = ['html']) {
  if (fs.existsSync(nycReport)) {
    const browserFiles = [];
    loaddir({
      dir: nycReport,
      onFile: file => {
        browserFiles.push(file);
      }
    });
    browserFiles.forEach(file => {
      const cont = JSON.parse(fs.readFileSync(file));
      map.merge(cont);
    });
    map = sm.transformCoverage(map).map;
    const unitFiles = [];
    loaddir({
      dir: nycReport,
      onFile: file => {
        if (file.match(/unit-coverage\.json$/)) unitFiles.push(file);
      }
    });
    unitFiles.forEach(file => {
      const cont = JSON.parse(fs.readFileSync(file));
      map.merge(cont);
    });
    loaddir({
      dir: srcFolder,
      onFile: file => {
        if (file.slice(-3) === '.js' && file.match(srcFileRegex) && !map.data[file]) {
          const content = fs.readFileSync(file).toString();
          instrumenter$1.instrumentSync(content, file);
          const emptyCov = {};
          emptyCov[file] = instrumenter$1.fileCoverage;
          map.merge(emptyCov);
        }
      }
    });
    map.filter(file => file.match(srcFileRegex));
    reporters.forEach(r => reporter.add(r));
    reporter.write(map);
  }
};

function loadTests(dir, mocha, regex, filters) {
  loaddir({
    dir: dir,
    onFile: filePath => {
      if (filters.map(bf => filePath.indexOf(bf) >= 0).indexOf(true) >= 0) {
        if (filePath.match(regex)) mocha.addFile(filePath);
      }
    }
  });
}
var run = async function ({
  root = path.resolve('./'),
  serverOnly = false,
  runUnitTests = true,
  runBrowserTests = true,
  coverage = false,
  setGlobals = true,
  testFileRegex = /\.test\.js$/,
  sourceFileRegex = /\.js$/,
  filters = [''],
  folders = {},
  preCommand = [],
  port = 8888,
  securePort = false,
  useJunitReporter = false,
  junitXmlFile = path.join(root, `./test-results/${path.basename(root)}/results.xml`),
  inspect = false,
  reporters = ['html']
} = {}) {
  if (inspect) inspector.open(undefined, undefined, true);
  deepmerge(folders, {
    unitTest: path.join(root, './test/unit'),
    browserTest: path.join(root, './test/browser'),
    public: path.join(root, './test/public'),
    static: [],
    coverage: path.join(root, './.nyc_output'),
    source: path.join(root, './src')
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
  if (serverOnly) {
    servers.listen();
    return;
  }
  if (setGlobals) testglobals();
  if (coverage && !commonjsGlobal.cov) {
    const {
      createInstrumenter
    } = istanbulLibInstrument;
    const instrumenter = createInstrumenter();
    const {
      hookRequire
    } = istanbulLibHook;
    hookRequire(filePath => filePath.indexOf(folders.source) > -1, (code, {
      filename
    }) => instrumenter.instrumentSync(code, filename));
    commonjsGlobal.cov = true;
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
    await loadbrowser(root, coverage, folders.coverage);
    loadTests(folders.browserTest, mocha$1, testFileRegex, filters);
  }
  if (runUnitTests || !runBrowserTests) {
    loadTests(folders.unitTest, mocha$1, testFileRegex, filters);
  }
  mocha$1.run(async failures => {
    servers.close();
    if (failures) {
      process.stdout.write(`---------- ${failures} FAILURES. ----------\n`);
      process.exitCode = 1;
    }
    if (commonjsGlobal.browser) await browser.close();
    if (coverage) {
      writecoverage(commonjsGlobal.__coverage__, path.join(folders.coverage, `./${Date.now()}-unit-coverage.json`));
      transformcoverage(folders.coverage, folders.source, sourceFileRegex, reporters);
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

exports.checkTag = sifrr_dev_7;
exports.deepMerge = sifrr_dev_3;
exports.default = sifrr_dev;
exports.eslintrc = sifrr_dev_1;
exports.exec = sifrr_dev_6;
exports.generateChangelog = sifrr_dev_5;
exports.getRollupConfig = sifrr_dev_4;
exports.gitAddCommitPush = sifrr_dev_9;
exports.loadDir = sifrr_dev_2;
exports.releaseTag = sifrr_dev_8;
exports.runTests = sifrr_dev_10;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.js.map
