const mkdirp = require('mkdirp');

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