const fs = require('fs');
const path = require('path');
const conventionalChangelog = require('conventional-changelog');
const rtag = /tag:\s*[v=]?(.+?)[,)]/gi;

module.exports = ({
  folder = process.cwd(),
  releaseCount = 0,
  changelogFile = path.join(folder, './CHANGELOG.md'),
  outputUnreleased = false,
  multiRepo = false
} = {}) => {
  let oldChangelog = '';
  const transform = function(cm, cb) {
    let match = rtag.exec(cm.gitTags);
    rtag.lastIndex = 0;
    if (match) cm.version = match[1];
    cb(null, cm);
  };
  const options = {
    pkg: {
      path: path.join(folder, './package.json'),
    },
    preset: 'angular',
    releaseCount,
    outputUnreleased,
    gitRawCommitsOpts: {
      path: folder
    },
    transform
  };

  if (fs.existsSync(changelogFile)) {
    if (releaseCount === 0) fs.writeFileSync(changelogFile, '');
    oldChangelog = fs.readFileSync(changelogFile, 'utf-8');
  }
  if (multiRepo) {
    options.transform = (cm, cb) => {
      if (cm.scope && cm.scope === multiRepo) cm.scope = null;
      else cm.type = 'chore';
      transform(cm, cb);
    };
  }
  return new Promise((res, rej) => {
    conventionalChangelog(options)
      .pipe(fs.createWriteStream(changelogFile))
      .on('error', rej)
      .on('finish', () => {
        fs.appendFileSync(changelogFile, oldChangelog);
        res(changelogFile);
      });
  });
};
