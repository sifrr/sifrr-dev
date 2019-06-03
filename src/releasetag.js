const exec = require('./exec');
const path = require('path');
const checkTag = require('./checktag');

async function releaseTag(version, prefix = 'v') {
  version = version || require(path.resolve('./package.json')).version;
  const tag = prefix + version;
  const exists = await checkTag(version, prefix);
  if (!exists) {
    await exec(`git tag -a ${tag} -m "Release of ${tag}"`);
    process.stdout.write('\n');
    await exec(`git push origin ${tag}`);
    return true;
  } else {
    return false;
  }
}

module.exports = releaseTag;
