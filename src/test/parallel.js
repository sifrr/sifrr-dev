const path = require('path');
const { fork } = require('child_process');
const JsonFn = require('json-fn');
const loadBrowser = require('./loadbrowser');

module.exports = async function(options) {
  const promises = [];
  await loadBrowser();
  const browserWSEndpoint = global.browser.wsEndpoint();

  let failures = 0;
  for (let i = 0; i < options.length; i++) {
    const opts = options[i];
    opts.browserWSEndpoint = browserWSEndpoint;

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

      childRun.send(JsonFn.stringify(opts));
    }));
  }

  await Promise.all(promises);
  await global.browser.close();

  if (failures > 0) {
    throw failures;
  } else {
    return 0;
  }
};
