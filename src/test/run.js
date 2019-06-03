const path = require('path');
const Mocha = require('mocha');

const exec = require('../exec');
const server = require('./server');
const deepMerge = require('../deepmerge');
const testGlobals = require('./testglobals');
const loadDir = require('../loaddir');
const writeCoverage = require('./writecoverage');
const loadBrowser = require('./loadbrowser');

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

module.exports = async function({
  root = path.resolve('./'),
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
  junitXmlFile = path.join(root, `./test-results/${path.basename(root)}/results.xml`),
  inspect = false
} = {}) {
  if (inspect) require('inspector').open(undefined, undefined, true);

  deepMerge(folders, {
    unitTest: path.join(root, './test/unit'),
    browserTest: path.join(root, './test/browser'),
    public: path.join(root, './test/public'),
    static: []
  }, true);

  if (Array.isArray(preCommand)) {
    for (let i = 0; i < preCommand.length; i++) {
      await exec(preCommand[i]).catch(global.console.error);
    }
  } else {
    await exec(preCommand).catch(global.console.error);
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
  if (setGlobals) testGlobals();

  if (coverage) {
    const { createInstrumenter } = require('istanbul-lib-instrument');
    const instrumenter = createInstrumenter();
    const { hookRequire } = require('istanbul-lib-hook');
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
  const mocha = new Mocha(mochaOptions);

  if (runBrowserTests || !runUnitTests) {
    servers.listen();
    await loadBrowser(root, coverage);
    loadTests(folders.browserTest, mocha, testFileRegex, filters);
  }

  if (runUnitTests || !runBrowserTests) {
    loadTests(folders.unitTest, mocha, testFileRegex, filters);
  }

  mocha.run(async (failures) => {
    servers.close();

    if (failures) {
      process.stdout.write(`---------- ${failures} FAILURES. ----------\n`);
      process.exitCode = 1;  // exit with non-zero status if there were failures
    }

    // close browser
    if (global.browser) await browser.close();

    // Get and write code coverage
    if (coverage) {
      writeCoverage(global.__coverage__, path.join(root, './.nyc_output', `./${Date.now()}-unit-coverage.json`));
    }

    process.exit(process.exitCode);
  });
};
