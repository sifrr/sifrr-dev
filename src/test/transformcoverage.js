const fs = require('fs');

const cov = require('istanbul-lib-coverage'),
  srcmap = require('istanbul-lib-source-maps'),
  { createInstrumenter } = require('istanbul-lib-instrument'),
  loadDir = require('../loaddir'),
  reporter = require('istanbul-api').createReporter();

const instrumenter = createInstrumenter({
  esModules: true
});

module.exports = function(nycReport, srcFolder, srcFileRegex, reporters = ['html']) {
  const sm = srcmap.createSourceMapStore({});
  let map = cov.createCoverageMap();
  if (fs.existsSync(nycReport)) {
    // Browser tests
    loadDir({
      dir: nycReport,
      onFile: file => {
        if (file.match(/browser/)) map.merge(JSON.parse(fs.readFileSync(file)));
      }
    });

    map = sm.transformCoverage(map).map;

    // unit tests
    loadDir({
      dir: nycReport,
      onFile: file => {
        if (file.match(/unit/)) map.merge(JSON.parse(fs.readFileSync(file)));
      }
    });

    // Add Other files without coverage
    loadDir({
      dir: srcFolder,
      onFile: file => {
        if (file.slice(-3) === '.js' && file.match(srcFileRegex) && !map.data[file]) {
          const content = fs.readFileSync(file).toString();
          instrumenter.instrumentSync(content, file);
          const emptyCov = {};
          emptyCov[file] = instrumenter.fileCoverage;
          map.merge(emptyCov);
        }
      }
    });

    // Remove files that we don't need coverage of
    map.filter(file => file.match(srcFileRegex));

    reporters.forEach(r => reporter.add(r));
    reporter.write(map);
  }
};
