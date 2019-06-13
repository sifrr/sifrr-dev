const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function hash() {
  return crypto.randomBytes(10).toString('hex');
}

module.exports = function writeCoverage(coverage, folder, prefix = '') {
  const file = path.join(folder, `${Date.now()}-${prefix}-${hash()}.json`);
  mkdirp.sync(path.dirname(file), (err) => {
    if (err) throw err;
  });

  const contents = JSON.stringify(coverage || {});
  if (contents !== '{}') fs.writeFileSync(file, contents);
};