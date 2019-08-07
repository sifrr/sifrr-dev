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
    onFile: filePath => {
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

async function runTests(options, parallel = false) {
  if (!Array.isArray(options)) options = [options];

  // run precommands
  for (let i = 0; i < options.length; i++) {
    await runCommands(options[i].preCommand);
    delete options[i].preCommand;
  }

  let result;
  if (parallel) {
    await loadBrowser();
    result = await require('./parallel')(options);
    await global.browser.close();
  } else {
    let failures = 0,
      coverage;
    for (let i = 0; i < options.length; i++) {
      await runTest(options[i]).then(({ failures: f, coverage: c }) => {
        if (Number(f)) failures += Number(f);
        coverage = c;
      });
    }
    result = { failures, coverage };
  }

  return result;
}

async function runTest(options, parallel = false) {
  const {
    root = path.resolve('./'),
    serverOnly = false,
    runUnitTests = true,
    runBrowserTests = true,
    coverage = false,
    setGlobals = true,
    testFileRegex = /\.test\.js$/,
    filters = [''],
    folders = {},
    port = 'random',
    securePort = false,
    useJunitReporter = false,
    junitXmlFile = path.join(root, `./test-results/${path.basename(root)}/results.xml`),
    inspect = false,
    reporters = ['html'],
    mochaOptions = {},
    before,
    browserWSEndpoint,
    isTS = fs.existsSync(path.join(root, 'tsconfig.json'))
  } = options;

  // merge options
  const allFolders = deepMerge(
    {
      unitTest: path.join(root, './test/unit'),
      browserTest: path.join(root, './test/browser'),
      public: path.join(root, './test/public'),
      static: [],
      coverage: path.join(root, './.nyc_output'),
      source: path.join(root, './src')
    },
    folders,
    true
  );
  const runBT = (runBrowserTests || !runUnitTests) && fs.existsSync(allFolders.browserTest);
  const runUT = (runUnitTests || !runBrowserTests) && fs.existsSync(allFolders.unitTest);

  // inspect?
  if (inspect) require('inspector').open(undefined, undefined, true);

  const beforeRet = typeof before === 'function' ? before() : false;
  if (beforeRet instanceof Promise) await beforeRet;

  // instrument code
  if (!global.___instrumented) {
    require('@babel/register')({
      root,
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ],
        isTS ? ['@babel/preset-typescript'] : false
      ].filter(p => p),
      plugins: [
        coverage
          ? [
              'istanbul',
              {
                include: ['**/src/**'],
                exclude: ['**/test/**']
              }
            ]
          : false,
        ['@babel/plugin-proposal-class-properties', { loose: true }]
      ].filter(p => p),
      ignore: [/node_modules/]
    });
    global.___instrumented = true;
  }

  const servers = await require('./server')(allFolders.public, {
    extraStaticFolders: allFolders.static,
    setGlobals,
    coverage,
    port,
    securePort
  });

  if (serverOnly) {
    await servers.listen();
    return 'server';
  }
  if (runBT) await loadBrowser(coverage, allFolders.coverage, browserWSEndpoint);
  if (setGlobals) testGlobals(options, parallel);

  if (useJunitReporter) {
    mochaOptions.reporter = 'mocha-junit-reporter';
    mochaOptions.reporterOptions = {
      mochaFile: junitXmlFile
    };
  }
  const mocha = new Mocha(mochaOptions);

  if (runBT) {
    await servers.listen();
    loadTests(allFolders.browserTest, mocha, testFileRegex, filters);
  }

  if (runUT) {
    loadTests(allFolders.unitTest, mocha, testFileRegex, filters);
  }

  // unhandledRejection and uncaughtExceptions
  process.on('unhandledRejection', (reason, promise) => {
    console.log(`Unhandled Rejection: ${promise}\n`, 'reason:', reason);
  });

  process.on('uncaughtException', (err, origin) => {
    console.log(`Uncaught exception: ${err}\n`, `origin: ${origin}`);
  });

  return new Promise(res => {
    mocha.run(async failures => {
      servers.close();

      // close browser
      if (global.browser && !browserWSEndpoint) {
        await browser.close();
        delete global.browser;
        delete global.page;
      }

      if (global.__pdescribes) {
        const fs = await Promise.all(global.__pdescribes);
        failures += fs.reduce((a, b) => a + b.failures, 0);
      }

      // Get and write code coverage
      let c;
      if (coverage) {
        writeCoverage(global.__coverage__, allFolders.coverage, 'unit-coverage');
        c = transformCoverage(allFolders.coverage, reporters);
      }

      res({
        failures,
        coverage: c
      });
    });
  });
}

process.on('message', async options => {
  options = JsonFn.parse(options);

  await runTest(options, true)
    .then(result => {
      process.send(JSON.stringify(result));
    })
    .then(r => {
      if (r !== 'server') process.exit();
    });
});

module.exports = runTests;
