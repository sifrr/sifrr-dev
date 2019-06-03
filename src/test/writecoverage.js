const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

module.exports = function writeCoverage(coverage, file) {
  mkdirp.sync(path.dirname(file), (err) => {
    if (err) throw err;
  });

  const contents = JSON.stringify(coverage || {});
  if (contents !== '{}') {
    fs.writeFileSync(file, contents, err => {
      if(err) throw err;
    });
  }
};