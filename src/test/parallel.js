const path = require('path');
const { fork } = require('child_process');

module.exports = async function(options) {
  const promises = [];
  let failures = 0;
  for (let i = 0; i < options.length; i++) {
    const opts = options[i];
    opts.before = opts.before ? opts.before.toString() : 'false';

    const childRun = fork(path.join(__dirname, './run'), process.argv);
    promises.push(new Promise(res => {
      childRun.on('exit', code => {
        if (code && code > 0) global.console.log('\x1b[36m%s\x1b[0m', `Config#${i}: tests from ${opts.root} exited with code ${code}`);
        res();
      });

      childRun.on('message', (e) => {
        failures += Number(e);
      });

      childRun.on('error', (e) => {
        global.console.error(e);
      });

      childRun.send(opts);
    }));
  }

  await Promise.all(promises);

  if (failures > 0) {
    throw Error(`${failures} Failures`);
  } else {
    return true;
  }
};
