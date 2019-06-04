const exec = require('./exec');
const path = require('path');

async function checkTag(version, prefix = 'v') {
  version = version || require(path.resolve('./package.json')).version;
  const tag = prefix + version;
  await exec('git pull');
  return exec(`git rev-parse ${tag}`).then(() => {
    process.stdout.write(`Tag ${tag} already exists.`);
    return true;
  }).catch(() => {
    return false;
  });
}

module.exports = checkTag;
