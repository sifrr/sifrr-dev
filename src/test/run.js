const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const JsonFn = require('json-fn');

const exec = require('../exec');
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

async function runCommands(commands) {
  if (!commands) return;
  if (Array.isArray(commands)) {
    for (let j = 0; j < commands.length; j++) {
      await exec(commands[j]).catch(global.console.error);
    }
  } else {
    await exec(commands).catch(global.console.error);
  }
}

async function runTests(options = {}, parallel = false) {
  if (Array.isArray(options)) {
    for (let i = 0; i < options.length; i++) {
      await runCommands(options[i].preCommand);
      delete options[i].preCommand;
    }
    if (parallel) return require('./parallel')(options);
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

  if (inspect) require('inspector').open(undefined, undefined, true);

  const beforeRet = typeof before === 'function' ? before() : false;
  if (beforeRet instanceof Promise) await beforeRet;

  const allFolders = deepMerge({
    unitTest: path.join(root, './test/unit'),
    browserTest: path.join(root, './test/browser'),
    public: path.join(root, './test/public'),
    static: [],
    coverage: path.join(root, './.nyc_output'),
    source: path.join(root, './src')
  }, folders, true);

  // unit test coverage
  if (coverage && !global.__s_dev_cov) {
    const { createInstrumenter } = require('istanbul-lib-instrument');
    const instrumenter = createInstrumenter();
    const { hookRequire } = require('istanbul-lib-hook');
    hookRequire(
      (filePath) => filePath.indexOf(allFolders.source) > -1 && filePath.match(sourceFileRegex),
      (code, { filename }) => instrumenter.instrumentSync(code, filename)
    );
    global.__s_dev_cov = true;
  }

  await runCommands(preCommand);

  const servers = await require('./server')(allFolders.public, {
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
  if (setGlobals) testGlobals(options, parallel);

  if (useJunitReporter) {
    mochaOptions.reporter = 'mocha-junit-reporter';
    mochaOptions.reporterOptions = {
      mochaFile: junitXmlFile
    };
  }
  const mocha = new Mocha(mochaOptions);

  if ((runBrowserTests || !runUnitTests) && fs.existsSync(allFolders.browserTest)) {
    servers.listen();
    await loadBrowser(coverage, allFolders.coverage, browserWSEndpoint);
    loadTests(allFolders.browserTest, mocha, testFileRegex, filters);
  }

  if ((runUnitTests || !runBrowserTests) && fs.existsSync(allFolders.unitTest)) {
    loadTests(allFolders.unitTest, mocha, testFileRegex, filters);
  }

  return new Promise((res, rej) => {
    mocha.run(async (failures) => {
      servers.close();

      // close browser
      if (global.browser && !browserWSEndpoint) {
        await browser.close();
        delete global.browser;
        delete global.page;
      }

      if (global.__pdescribes) {
        const fs = await Promise.all(global.__pdescribes);
        failures += fs.reduce((a, b) => a + b, 0);
      }

      // Get and write code coverage
      if (coverage) {
        writeCoverage(global.__coverage__, allFolders.coverage, 'unit-coverage');
        transformCoverage(allFolders.coverage, allFolders.source, sourceFileRegex, reporters);
      }

      if (failures) rej(failures);
      else res(0);
    });
  });
}


process.on('message', async (options) => {
  options = JsonFn.parse(options);

  await runTests(options, true).catch(f => {
    if (Number(f)) process.send(`${f}`);
    else process.stderr.write(f + '\n');
  }).then(r => {
    if (r !== 'server') process.exit();
  });
});

module.exports = runTests;
