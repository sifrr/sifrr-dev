const path = require('path');
const { fork } = require('child_process');

module.exports = async function(options) {
  const promises = [];
  let exitCode = 0;
  for (let i = 0; i < options.length; i++) {
    const opts = options[i];
    opts.before = opts.before ? opts.before.toString() : 'false';

    const childRun = fork(path.join(__dirname, './run'), process.argv);
    promises.push(new Promise(res => {
      childRun.on('exit', code => {
        if (code && code > 0) global.console.log('\x1b[36m%s\x1b[0m', `Config#${i}: tests from ${opts.root} exited with code ${code}`);
        res();
      });

      childRun.on('error', (e) => {
        global.console.error(e);
        exitCode = 1;
      });

      childRun.send(opts);
    }));
  }

  await Promise.all(promises);
  process.exit(exitCode);
};
