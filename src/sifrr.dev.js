module.exports = {
  loadDir: require('./loaddir'),
  deepMerge: require('./deepmerge'),
  getRollupConfig: require('./getrollupconfig'),
  generateChangelog: require('./generatechangelog'),
  exec: require('./exec'),
  checkTag: require('./checktag'),
  releaseTag: require('./releasetag'),
  gitAddCommitPush: require('./gitaddcommitpush'),
  runTests: require('./test/run'),
  objectSelect: require('./objectselect')
};
