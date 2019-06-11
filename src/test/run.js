const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const JsonFn = require('json-fn');

const exec = require('../exec');
const server = require('./server');
const deepMerge = require('../deepmerge');
const testGlobals = require('./testglobals');
const loadDir = require('../loaddir');
const writeCoverage = require('./writecoverage');
const loadBrowser = require('./loadbrowser');
const transformCoverage = require('./transformcoverage');

function loadTests(dir, mocha, regex, filters) {
  loadDir({
    dir: dir,
    onFile: (filePath) => {
      if (filters.map(bf => filePath.indexOf(bf) >= 0).indexOf(true) >= 0) {
        if (filePath.match(regex)) mocha.addFile(filePath);
      }
    }
  });
}

async function runTests(options = {}) {
  if (Array.isArray(options)) return require('./parallel')(options);

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
    preCommand = [],
    port = 'random',
    securePort = false,
    useJunitReporter = false,
    junitXmlFile = path.join(root, `./test-results/${path.basename(root)}/results.xml`),
    inspect = false,
    reporters = ['html'],
    mochaOptions = {}
  } = options;

  if (inspect) require('inspector').open(undefined, undefined, true);

  const allFolders = deepMerge({
    unitTest: path.join(root, './test/unit'),
    browserTest: path.join(root, './test/browser'),
    public: path.join(root, './test/public'),
    static: [],
    coverage: path.join(root, './.nyc_output'),
    source: path.join(root, './src')
  }, folders, true);

  // unit test coverage
  if (coverage && !global.cov) {
    const { createInstrumenter } = require('istanbul-lib-instrument');
    const instrumenter = createInstrumenter();
    const { hookRequire } = require('istanbul-lib-hook');
    hookRequire(
      (filePath) => {
        return filePath.indexOf(allFolders.source) > -1 && filePath.match(sourceFileRegex) && !filePath.match(testFileRegex);
      },
      (code, { filename }) => instrumenter.instrumentSync(code, filename)
    );
    global.cov = true;
  }

  if (Array.isArray(preCommand)) {
    for (let i = 0; i < preCommand.length; i++) {
      await exec(preCommand[i]).catch(global.console.error);
    }
  } else {
    await exec(preCommand).catch(global.console.error);
  }

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
  if (setGlobals) testGlobals(options);

  if (useJunitReporter) {
    mochaOptions.reporter = 'mocha-junit-reporter';
    mochaOptions.reporterOptions = {
      mochaFile: junitXmlFile
    };
  }
  const mocha = new Mocha(mochaOptions);

  if ((runBrowserTests || !runUnitTests) && fs.existsSync(allFolders.browserTest)) {
    servers.listen();
    await loadBrowser(root, coverage, allFolders.coverage);
    loadTests(allFolders.browserTest, mocha, testFileRegex, filters);
  }

  if ((runUnitTests || !runBrowserTests) && fs.existsSync(allFolders.unitTest)) {
    loadTests(allFolders.unitTest, mocha, testFileRegex, filters);
  }

  return new Promise((res, rej) => {
    mocha.run(async (failures) => {
      servers.close();

      // close browser
      if (global.browser) {
        await browser.close();
        delete global.browser;
        delete global.page;
      }

      // Get and write code coverage
      if (coverage) {
        writeCoverage(global.__coverage__, path.join(allFolders.coverage, `./${Date.now()}-unit-coverage.json`));
        transformCoverage(allFolders.coverage, allFolders.source, sourceFileRegex, reporters);
      }

      if (failures) return rej(failures);
      res(0);
    });
  });
}


process.on('message', async (options) => {
  options = JsonFn.parse(options);
  const before = typeof options.before === 'function' ? options.before() : false;
  if (before instanceof Promise) await before;

  await runTests(options).catch(f => {
    if (Number(f)) process.send(`${f}`);
    else throw f;
  }).then(r => {
    if (r !== 'server') process.exit();
  });
});

module.exports = runTests;
