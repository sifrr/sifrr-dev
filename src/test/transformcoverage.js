const fs = require('fs');

const cov = require('istanbul-lib-coverage'),
  srcmap = require('istanbul-lib-source-maps'),
  { createInstrumenter } = require('istanbul-lib-instrument'),
  loadDir = require('../loaddir'),
  reporter = require('istanbul-api').createReporter();

let map = cov.createCoverageMap();
const instrumenter = createInstrumenter();
const sm = srcmap.createSourceMapStore({});

module.exports = function(nycReport, srcFolder, srcFileRegex, reporters = ['html']) {
  if (fs.existsSync(nycReport)) {
    // Browser tests
    const browserFiles = [];
    loadDir({
      dir: nycReport,
      onFile: (file) => {
        browserFiles.push(file);
      }
    });

    browserFiles.forEach((file) => {
      const cont = JSON.parse(fs.readFileSync(file));
      map.merge(cont);
    });

    map = sm.transformCoverage(map).map;

    // unit tests
    const unitFiles = [];
    loadDir({
      dir: nycReport,
      onFile: (file) => {
        if (file.match(/unit-coverage\.json$/)) unitFiles.push(file);
      }
    });

    unitFiles.forEach((file) => {
      const cont = JSON.parse(fs.readFileSync(file));
      map.merge(cont);
    });

    // Add Other files without coverage
    loadDir({
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

    // Remove files that we don't need coverage of
    map.filter((file) => file.match(srcFileRegex));

    reporters.forEach(r => reporter.add(r));
    reporter.write(map);
  }
};
