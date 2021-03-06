const path = require('path');
const fs = require('fs');

const loadDir = require('../loaddir');
const getPorts = require('./getports');
const instrumenter = require('istanbul-lib-instrument').createInstrumenter();
const { App, SSLApp } = require('@sifrr/server');

function staticInstrument(app, folder, coverage = false) {
  loadDir({
    dir: folder,
    onFile: filePath => {
      if (coverage && filePath.slice(-3) === '.js' && fs.existsSync(filePath + '.map')) {
        app.get('/' + path.relative(folder, filePath), res => {
          res.onAborted(global.console.log);
          const text = fs.readFileSync(filePath, 'utf-8');
          res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
          res.end(
            instrumenter.instrumentSync(
              text,
              filePath,
              JSON.parse(fs.readFileSync(filePath + '.map'))
            )
          );
        });
      } else {
        app.file('/' + path.relative(folder, filePath), filePath);
      }
    }
  });
}

module.exports = async function(
  root,
  {
    extraStaticFolders = [],
    setGlobals = true,
    coverage = true,
    port = false,
    securePort = false
  } = {}
) {
  const apps = [];
  function startServer(app, hostingPort, secure) {
    staticInstrument(app, root, coverage);
    staticInstrument(app, path.join(root, '../../dist'), coverage);
    extraStaticFolders.forEach(folder => {
      staticInstrument(app, folder, coverage);
    });

    apps.push([app, hostingPort, secure]);
  }

  let normalApp, secureApp;

  if (port) {
    let app;
    if (fs.existsSync(path.join(root, 'server.js'))) {
      app = require(path.join(root, 'server.js'));
    } else {
      app = new App();
    }
    if (typeof app.file === 'function') startServer(app, port, false);
    else apps.push([app, port, false]);
    normalApp = app;
  }

  if (securePort) {
    let app;
    if (fs.existsSync(path.join(root, 'secureserver.js'))) {
      app = require(path.join(root, 'secureserver.js'));
    } else {
      app = new SSLApp({
        // eslint-disable-next-line camelcase
        key_file_name: path.join(__dirname, 'keys/server.key'),
        // eslint-disable-next-line camelcase
        cert_file_name: path.join(__dirname, 'keys/server.crt')
      });
    }
    if (typeof app.file === 'function') startServer(app, securePort, true);
    else apps.push([app, securePort, true]);
    secureApp = app;
  }

  return {
    secureApp: secureApp,
    app: normalApp,
    listen: async () => {
      for (let i = 0; i < apps.length; i++) {
        let [app, port, secure] = apps[i];
        // eslint-disable-next-line require-atomic-updates
        if (port === 'random') port = (await getPorts())[0];

        if (setGlobals && port) {
          global[secure ? 'SPATH' : 'PATH'] = `http${secure ? 's' : ''}://localhost:${port}`;
          global[secure ? 'securePort' : 'port'] = port;
        }

        app.listen(port, socket => {
          if (socket) {
            global.console.log(`Test server listening on port ${port}, serving ${root}`);
          } else {
            global.console.log('Test server failed to listen to port ' + port);
          }
        });
      }
    },
    close: () => {
      secureApp && secureApp.close && secureApp.close();
      normalApp && normalApp.close && normalApp.close();
    }
  };
};
