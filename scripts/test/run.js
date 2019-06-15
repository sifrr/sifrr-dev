const path = require('path');

// Check if need coverage
const coverage = process.env.COVERAGE === 'true';

// coverage for require
if (coverage) {
  const { createInstrumenter } = require('istanbul-lib-instrument');
  const instrumenter = createInstrumenter();
  const { hookRequire } = require('istanbul-lib-hook');
  hookRequire((filePath) => filePath.match(/\/src/), (code, { filename }) => instrumenter.instrumentSync(code, filename));
  global.cov = true;
}

// check if should inspect or not
const inspect = process.argv.indexOf('-i') > 0 || process.argv.indexOf('--inspect') > 0;

// check if need junit reporter
const useJunitReporter = process.argv.indexOf('-j') > 0 || process.argv.indexOf('--junit') > 0;

// check if run only unit test
const runUnitTests = process.argv.indexOf('-u') > 0 || process.argv.indexOf('--unit') > 0;

// check if run only browser tests
const runBrowserTests = process.argv.indexOf('-b') > 0 || process.argv.indexOf('--browser') > 0;

// check if run only browser tests
const serverOnly = process.argv.indexOf('-s') > 0 || process.argv.indexOf('--server') > 0;

// test port
let port = 8888;
const portIndex = Math.max(process.argv.indexOf('--test-port'), process.argv.indexOf('-tp'));
if (portIndex !== -1) {
  port = +process.argv[portIndex + 1];
}

// check if need to filter
let filters;
const filter = process.argv.indexOf('-f') || process.argv.indexOf('--filter');
if (filter > 0) {
  filters = process.argv[filter + 1].split(',');
}

// reporters
const reporters = ['html'];
if (process.env.LCOV === 'true') reporters.push('lcov');

const root = path.resolve(process.argv[2]) || path.resolve('./');

const runTest = require('../../src/test/run');
const opts = {
  root,
  serverOnly,
  runUnitTests,
  runBrowserTests,
  coverage,
  filters,
  preCommand: 'cd ./test/public && yarn build',
  port: 'random',
  securePort: 'random',
  useJunitReporter,
  inspect,
  folders: {
    static: [path.resolve('./src/test')]
  },
  reporters
};

(async () => {
  let failures = 0;
  await runTest(opts).catch(e => {
    global.console.log(`${e} tests failed!`);
    failures += Number(e);
  });
  await runTest([opts], true).catch(e => {
    global.console.log(`${e} tests failed!`);
    failures += Number(e);
  });

  if (failures > 0) process.exit(1);
  global.console.log('All tests passed!');
})();
