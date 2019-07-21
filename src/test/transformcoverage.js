const fs = require('fs');
const path = require('path');

const cov = require('istanbul-lib-coverage'),
  srcmap = require('istanbul-lib-source-maps'),
  loadDir = require('../loaddir'),
  reporter = require('istanbul-api').createReporter();

module.exports = function(nycReport, reporters = ['html']) {
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

    reporters.forEach(r => reporter.add(r));
    reporter.add('json-summary');
    reporter.write(map);

    try {
      const jsonCovPath = path.resolve('./coverage/coverage-summary.json');
      const total = JSON.parse(fs.readFileSync(jsonCovPath, 'UTF-8').replace('{,', '{')).total;
      const ret = {};
      for (let type in total) {
        ret[type] = total[type].pct + '%';
      }
      return ret;
    } catch (e) {
      console.error(e);
      return;
    }
  }
};
