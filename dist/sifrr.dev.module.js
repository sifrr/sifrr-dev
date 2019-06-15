/*! sifrr.dev v0.0.10 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr-dev */
import fs from 'fs';
import path from 'path';
import rollupPluginBabel from 'rollup-plugin-babel';
import rollupPluginTerser from 'rollup-plugin-terser';
import rollupPluginNodeResolve from 'rollup-plugin-node-resolve';
import rollupPluginCommonjs from 'rollup-plugin-commonjs';
import rollupPluginCleanup from 'rollup-plugin-cleanup';
import rollupPluginPostcss from 'rollup-plugin-postcss';
import rollupPluginHtml from 'rollup-plugin-html';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import conventionalChangelog from 'conventional-changelog';
import child_process from 'child_process';
import mocha from 'mocha';
import jsonFn from 'json-fn';
import chai$1 from 'chai';
import sinon from 'sinon';
import crypto from 'crypto';
import puppeteer from 'puppeteer';
import chaiAsPromised from 'chai-as-promised';
import istanbulLibCoverage from 'istanbul-lib-coverage';
import istanbulLibSourceMaps from 'istanbul-lib-source-maps';
import istanbulLibInstrument from 'istanbul-lib-instrument';
import istanbulApi from 'istanbul-api';
import inspector from 'inspector';
import istanbulLibHook from 'istanbul-lib-hook';
import portfinder from 'portfinder';
import server$1 from '@sifrr/server';

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
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    fs.statSync(filePath).isDirectory() ? onDir(filePath) : onFile(filePath);
    if (deep > 0) loadDir({ dir: filePath, onFile, onDir, deep: deep - 1});
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
  const format = type === 'cjs' ? 'cjs' : (type === 'browser' ? 'umd' : 'es');
  const ret = {
    input: inputFile,
    output: {
      file: path.join(outputFolder, `./${(outputFileName || filename) + (type === 'module' ? '.module' : '') + (minify ? '.min' : '')}.js`),
      format,
      name,
      sourcemap: !minify,
      preferConst: true,
    },
    plugins: [
      rollupPluginNodeResolve({
        browser: type === 'browser',
        mainFields: ['module', 'main']
      }),
      rollupPluginCommonjs(),
      rollupPluginPostcss({
        extensions: ['.css', '.scss', '.sass', '.less'],
        inject: false,
        plugins: [
          minify ? cssnano({
            preset: [ 'default' ],
          }) : false,
          autoprefixer
        ].filter(k => k)
      }),
      rollupPluginHtml({
        htmlMinifierOptions: minify ? {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          conservativeCollapse: true,
          minifyJS: true
        } : {}
      })
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

const rtag = /tag:\s*[v=]?(.+?)[,)]/gi;
var generatechangelog = ({
  folder = path.resolve('./'),
  releaseCount = 0,
  changelogFile = path.join(folder, './CHANGELOG.md'),
  outputUnreleased = false,
  multiRepo = false
} = {}) => {
  let oldChangelog = '';
  let first = false;
  let packageVersion = commonjsRequire(path.join(folder, './package.json')).version;
  const transform = function(cm, cb) {
    if (outputUnreleased && !first) {
      cm.version = packageVersion;
      first = true;
    }
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
const splitRegex = /((?:["'][^"]+["'])|(?:[^ ]+))/;
function exec(command, options = {}) {
  if (command.indexOf('sh ') === 0 || options.spawn) {
    process.stdout.write(`Running command: ${command} with spawn \n`);
    options.stdio = options.stdio || 'inherit';
    return new Promise((res, rej) => {
      const [c, ...args] = command.split(splitRegex).filter(x => x.trim() !== '');
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
    process.stdout.write(`Running command: ${command} \n`);
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

async function checkTag(version, prefix = 'v') {
  version = version || commonjsRequire(path.resolve('./package.json')).version;
  const tag = prefix + version;
  await exec_1('git pull');
  return exec_1(`git rev-parse ${tag}`).then(() => {
    process.stdout.write(`Tag ${tag} already exists.\n`);
    return true;
  }).catch(() => {
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

function hash() {
  return crypto.randomBytes(10).toString('hex');
}
var writecoverage = function writeCoverage(coverage, folder, prefix = '') {
  const file = path.join(folder, `${Date.now()}-${prefix}-${hash()}.json`);
  mkdirp.sync(path.dirname(file), (err) => {
    if (err) throw err;
  });
  const contents = JSON.stringify(coverage || {});
  if (contents !== '{}') fs.writeFileSync(file, contents);
};

async function writePageCoverage(p, nycReport) {
  const jsCoverage = await p.evaluate(() => window.__coverage__);
  writecoverage(jsCoverage, nycReport, 'browser-coverage');
}
function setPageForCoverage(p, nycReport) {
  p.goto = async (url, options) => {
    await writePageCoverage(p, nycReport);
    return p.mainFrame().goto(url, options);
  };
  p._close = p.close;
  p.close = async () => {
    await writePageCoverage(p, nycReport);
    return p._close();
  };
}
var loadbrowser = async function(coverage, nycReport, browserWSEndpoint) {
  let browser;
  if (!commonjsGlobal.browser) {
    if (typeof browserWSEndpoint === 'string') {
      browser = commonjsGlobal.browser = await puppeteer.connect({
        browserWSEndpoint,
        ignoreHTTPSErrors: true
      });
    } else {
      browser = commonjsGlobal.browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        ignoreHTTPSErrors: true,
        headless: process.env.HEADLESS !== 'false',
        devtools: false
      });
    }
    if (coverage && nycReport) {
      browser.__newPage = browser.newPage;
      browser.newPage = async () => {
        const p = await browser.__newPage();
        setPageForCoverage(p, nycReport);
        return p;
      };
      browser.__close = browser.close;
      browser.close = async () => {
        const pages = await browser.pages();
        for (let i = 0; i < pages.length; i++) {
          await pages[i].close();
        }
        return browser.__close();
      };
    }
  } else {
    browser = commonjsGlobal.browser;
  }
  const page = await browser.newPage();
  await page.setViewport( { width: 1280, height: 800 } );
  if (!commonjsGlobal.page) commonjsGlobal.page = page;
  return {
    browser,
    page
  };
};

const { fork } = child_process;
var parallel = async function(options, shareBrowser = true) {
  const promises = [];
  let failures = 0;
  if (shareBrowser) await loadbrowser();
  for (let i = 0; i < options.length; i++) {
    const opts = options[i];
    opts.browserWSEndpoint = shareBrowser ? commonjsGlobal.browser.wsEndpoint() : opts.browserWSEndpoint;
    const childRun = fork(path.join(__dirname, './run'), process.argv);
    promises.push(new Promise(res => {
      childRun.on('exit', code => {
        if (code && code > 0) commonjsGlobal.console.log('\x1b[36m%s\x1b[0m', `Config#${i}: tests from ${opts.root} exited with code ${code}`);
        res();
      });
      childRun.on('message', (e) => {
        failures += Number(e);
      });
      childRun.on('error', (e) => {
        commonjsGlobal.console.error(e);
      });
      childRun.send(jsonFn.stringify(opts));
    }));
  }
  await Promise.all(promises);
  if (shareBrowser) await commonjsGlobal.browser.close();
  if (failures > 0) {
    throw failures;
  } else {
    return 0;
  }
};

function getCaller() {
  try {
    let err = new Error();
    let callerfile;
    let currentfile;
    Error.prepareStackTrace = function (err, stack) { return stack; };
    currentfile = err.stack.shift().getFileName();
    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();
      if(currentfile !== callerfile) return callerfile;
    }
  } catch (err) {
  }
  return undefined;
}
var testglobals = (testOptions, parallel$1) => {
  commonjsGlobal.__pdescribes = [];
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
      }, time);
    });
  };
  commonjsGlobal.pdescribe = function(name, fxn) {
    const testFile = getCaller();
    if (testFile && testOptions && !testOptions.parallel && parallel$1) {
      const newOpts = deepmerge({}, testOptions);
      deepmerge(newOpts, {
        browserWSEndpoint: commonjsGlobal.browser ? commonjsGlobal.browser.wsEndpoint() : undefined,
        filters: [testFile],
        parallel: true,
        junitXmlFile: path.join(testOptions.junitXmlFile, `../../${path.basename(getCaller()).replace('.test.js', '')}/results.xml`),
        port: 'random'
      });
      commonjsGlobal.__pdescribes.push(parallel([newOpts], true).catch(e => e));
    } else {
      describe(name, fxn);
    }
  };
  chai.use(chaiAsPromised);
};

const { createInstrumenter } = istanbulLibInstrument,
  reporter = istanbulApi.createReporter();
const instrumenter = createInstrumenter({
  esModules: true
});
var transformcoverage = function(nycReport, srcFolder, srcFileRegex, reporters = ['html']) {
  const sm = istanbulLibSourceMaps.createSourceMapStore({});
  let map = istanbulLibCoverage.createCoverageMap();
  if (fs.existsSync(nycReport)) {
    loaddir({
      dir: nycReport,
      onFile: (file) => {
        if (file.match(/browser/)) map.merge(JSON.parse(fs.readFileSync(file)));
      }
    });
    map = sm.transformCoverage(map).map;
    loaddir({
      dir: nycReport,
      onFile: (file) => {
        if (file.match(/unit/)) map.merge(JSON.parse(fs.readFileSync(file)));
      }
    });
    loaddir({
      dir: srcFolder,
      onFile: (file) => {
        if (file.slice(-3) === '.js' && file.match(srcFileRegex) && !map.data[file]) {
          const content = fs.readFileSync(file).toString();
          instrumenter.instrumentSync(content, file);
          const emptyCov = {};
          emptyCov[file] = instrumenter.fileCoverage;
          map.merge(emptyCov);
        }
      }
    });
    map.filter((file) => file.match(srcFileRegex));
    reporters.forEach(r => reporter.add(r));
    reporter.write(map);
  }
};

var getports = async function() {
  const first = await portfinder.getPortPromise({
    port: 10000
  });
  const second = await portfinder.getPortPromise({
    port: first + 1,
  });
  return [first, second];
};

const instrumenter$1 = istanbulLibInstrument.createInstrumenter();
const { App, SSLApp } = server$1;
function staticInstrument(app, folder, coverage = false) {
  loaddir({
    dir: folder,
    onFile: (filePath) => {
      if (coverage && filePath.slice(-3) === '.js') {
        app.get('/' + path.relative(folder, filePath), (res) => {
          res.onAborted(commonjsGlobal.console.log);
          const text = fs.readFileSync(filePath, 'utf-8');
          if (fs.existsSync(filePath + '.map')) {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.end(instrumenter$1.instrumentSync(text, filePath, JSON.parse(fs.readFileSync(filePath + '.map'))));
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
    staticInstrument(app, path.join(root, '../../dist'), coverage);
    extraStaticFolders.forEach(folder => {
      staticInstrument(app, folder, coverage);
    });
    listeners.push(app.listen.bind(app, hostingPort, (socket) => {
      if (socket) {
        commonjsGlobal.console.log(`Test server listening on port ${hostingPort}, serving ${root}`);
      } else {
        commonjsGlobal.console.log('Test server failed to listen to port ' + hostingPort);
      }
    }));
  }
  let normalApp, secureApp;
  const freePorts = await getports();
  if (port) {
    if (port === 'random') port = freePorts[0];
    let app;
    if (fs.existsSync(path.join(root, 'server.js'))) {
      app = commonjsRequire(path.join(root, 'server.js'));
    } else {
      app = new App();
    }
    if (typeof app.file === 'function') startServer(app, port);
    else listeners.push(app.listen.bind(app, port));
    normalApp = app;
  }
  if (setGlobals && port) {
    commonjsGlobal.PATH = `http://localhost:${port}`;
    commonjsGlobal.port = port;
  }
  if (securePort) {
    if (securePort === 'random') securePort = freePorts[1];
    let app;
    if (fs.existsSync(path.join(root, 'secureserver.js'))) {
      app = commonjsRequire(path.join(root, 'secureserver.js'));
    } else {
      app = new SSLApp({
        key_file_name: path.join(__dirname, 'keys/server.key'),
        cert_file_name: path.join(__dirname, 'keys/server.crt')
      });
    }
    if (typeof app.file === 'function') startServer(app, securePort);
    else listeners.push(app.listen.bind(app, securePort));
    secureApp = app;
  }
  if (setGlobals && securePort) {
    commonjsGlobal.SPATH = `https://localhost:${securePort}`;
    commonjsGlobal.securePort = securePort;
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
async function runCommands(commands) {
  if (!commands) return;
  if (Array.isArray(commands)) {
    for (let j = 0; j < commands.length; j++) {
      await exec_1(commands[j]).catch(commonjsGlobal.console.error);
    }
  } else {
    await exec_1(commands).catch(commonjsGlobal.console.error);
  }
}
async function runTests(options = {}, parallel$1 = false) {
  if (Array.isArray(options)) {
    for (let i = 0; i < options.length; i++) {
      await runCommands(options[i].preCommand);
      delete options[i].preCommand;
    }
    if (parallel$1) return parallel(options);
    else {
      let failures = 0;
      for (let i = 0; i < options.length; i++) {
        failures += await runTests(options[i]).catch(f => {
          if (Number(f)) return Number(f);
          else process.stderr.write(f + '\n');
          return 0;
        });
      }
      if (failures > 0) throw failures;
      else return 0;
    }
  }
  const {
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
    preCommand = false,
    port = 'random',
    securePort = false,
    useJunitReporter = false,
    junitXmlFile = path.join(root, `./test-results/${path.basename(root)}/results.xml`),
    inspect = false,
    reporters = ['html'],
    mochaOptions = {},
    before,
    browserWSEndpoint
  } = options;
  if (inspect) inspector.open(undefined, undefined, true);
  const beforeRet = typeof before === 'function' ? before() : false;
  if (beforeRet instanceof Promise) await beforeRet;
  const allFolders = deepmerge({
    unitTest: path.join(root, './test/unit'),
    browserTest: path.join(root, './test/browser'),
    public: path.join(root, './test/public'),
    static: [],
    coverage: path.join(root, './.nyc_output'),
    source: path.join(root, './src')
  }, folders, true);
  if (coverage && !commonjsGlobal.__s_dev_cov) {
    const { createInstrumenter } = istanbulLibInstrument;
    const instrumenter = createInstrumenter();
    const { hookRequire } = istanbulLibHook;
    hookRequire(
      (filePath) => filePath.indexOf(allFolders.source) > -1 && filePath.match(sourceFileRegex),
      (code, { filename }) => instrumenter.instrumentSync(code, filename)
    );
    commonjsGlobal.__s_dev_cov = true;
  }
  await runCommands(preCommand);
  const servers = await server(allFolders.public, {
    extraStaticFolders: allFolders.static,
    setGlobals,
    coverage,
    port,
    securePort
  });
  if (serverOnly) {
    servers.listen();
    return 'server';
  }
  if (setGlobals) testglobals(options, parallel$1);
  if (useJunitReporter) {
    mochaOptions.reporter = 'mocha-junit-reporter';
    mochaOptions.reporterOptions = {
      mochaFile: junitXmlFile
    };
  }
  const mocha$1 = new mocha(mochaOptions);
  if ((runBrowserTests || !runUnitTests) && fs.existsSync(allFolders.browserTest)) {
    servers.listen();
    await loadbrowser(coverage, allFolders.coverage, browserWSEndpoint);
    loadTests(allFolders.browserTest, mocha$1, testFileRegex, filters);
  }
  if ((runUnitTests || !runBrowserTests) && fs.existsSync(allFolders.unitTest)) {
    loadTests(allFolders.unitTest, mocha$1, testFileRegex, filters);
  }
  return new Promise((res, rej) => {
    mocha$1.run(async (failures) => {
      servers.close();
      if (commonjsGlobal.browser && !browserWSEndpoint) {
        await browser.close();
        delete commonjsGlobal.browser;
        delete commonjsGlobal.page;
      }
      if (commonjsGlobal.__pdescribes) {
        const fs = await Promise.all(commonjsGlobal.__pdescribes);
        failures += fs.reduce((a, b) => a + b, 0);
      }
      if (coverage) {
        writecoverage(commonjsGlobal.__coverage__, allFolders.coverage, 'unit-coverage');
        transformcoverage(allFolders.coverage, allFolders.source, sourceFileRegex, reporters);
      }
      if (failures) rej(failures);
      else res(0);
    });
  });
}
process.on('message', async (options) => {
  options = jsonFn.parse(options);
  await runTests(options, true).catch(f => {
    if (Number(f)) process.send(`${f}`);
    else process.stderr.write(f + '\n');
  }).then(r => {
    if (r !== 'server') process.exit();
  });
});
var run = runTests;

var objectselect = (obj, keys = []) => {
  const ret = {};
  keys.forEach(k => {
    if (obj[k]) ret[k] = obj[k];
  });
  return ret;
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
  runTests: run,
  objectSelect: objectselect
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
var sifrr_dev_11 = sifrr_dev.objectSelect;

export default sifrr_dev;
export { sifrr_dev_7 as checkTag, sifrr_dev_3 as deepMerge, sifrr_dev_1 as eslintrc, sifrr_dev_6 as exec, sifrr_dev_5 as generateChangelog, sifrr_dev_4 as getRollupConfig, sifrr_dev_9 as gitAddCommitPush, sifrr_dev_2 as loadDir, sifrr_dev_11 as objectSelect, sifrr_dev_8 as releaseTag, sifrr_dev_10 as runTests };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dev.module.js.map
