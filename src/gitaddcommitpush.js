const exec = require('./exec');

module.exports = async function({
  preCommand = false,
  files = '*',
  commitMsg = 'chore: add new files',
  push = true
} = {}) {
  if (preCommand) {
    if (Array.isArray(preCommand)) {
      for (let i = 0; i < preCommand.length; i++) {
        await exec(preCommand[i]);
      }
    } else {
      await exec(preCommand);
    }
  }
  if (Array.isArray(files)) {
    for (let i = 0; i < files.length; i++) {
      await exec(`git ls-files '${files[i]}' | xargs git add`);
    }
  } else {
    await exec(`git ls-files '${files}' | xargs git add`);
  }
  await exec(`git commit -m "${commitMsg}"`)
    .then(() => {
      if (push) exec(`git push`);
    })
    .catch(() => {
      process.stdout.write('Nothing to commit, not running git push. \n');
    });
};
