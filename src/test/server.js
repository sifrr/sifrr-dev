const path = require('path');
const fs = require('fs');

const loadDir = require('../loaddir');
const instrumenter = require('istanbul-lib-instrument').createInstrumenter();
const { App, SSLApp } = require('@sifrr/server');

function staticInstrument(app, folder, coverage = false) {
  loadDir({
    dir: folder,
    onFile: (filePath) => {
      if (coverage && filePath.slice(-3) === '.js') {
        app.get('/' + path.relative(folder, filePath), (res) => {
          res.onAborted(global.console.log);
          const text = fs.readFileSync(filePath, 'utf-8');
          if (fs.existsSync(filePath + '.map')) {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.end(instrumenter.instrumentSync(text, filePath, JSON.parse(fs.readFileSync(filePath + '.map'))));
          } else {
            res.writeHeader('content-type', 'application/javascript; charset=UTF-8');
            res.end(text);
          }
        });
      } else {
        app.file('/' + path.relative(folder, filePath), filePath);
      }
    }
  });
}

module.exports = async function(root, {
  extraStaticFolders = [],
  setGlobals = true,
  coverage = true,
  port = false,
  securePort = false
} = {}) {
  const listeners = [];
  function startServer(app, hostingPort) {
    staticInstrument(app, root, coverage);
    staticInstrument(app, path.join(root, '../../dist'), coverage);
    extraStaticFolders.forEach(folder => {
      staticInstrument(app, folder, coverage);
    });

    listeners.push(app.listen.bind(app, hostingPort, (socket) => {
      if (socket) {
        global.console.log(`Test server listening on port ${hostingPort}, serving ${root}`);
      } else {
        global.console.log('Test server failed to listen to port ' + hostingPort);
      }
    }));
  }

  let normalApp, secureApp;

  if (setGlobals && port) {
    global.PATH = `http://localhost:${port}`;
    global.port = port;
  }

  if (port) {
    let app;
    if (fs.existsSync(path.join(root, 'server.js'))) {
      app = require(path.join(root, 'server.js'));
    } else {
      app = new App();
    }
    if (typeof app.file === 'function') startServer(app, port);
    else listeners.push(app.listen.bind(app, port));
    normalApp = app;
  }

  if (setGlobals && securePort) {
    global.SPATH = `https://localhost:${securePort}`;
    global.securePort = securePort;
  }

  if (securePort) {
    let app;
    if (fs.existsSync(path.join(root, 'secureserver.js'))) {
      app = require(path.join(root, 'secureserver.js'));
    } else {
      app = new SSLApp({
        key_file_name: path.join(__dirname, 'keys/server.key'),
        cert_file_name: path.join(__dirname, 'keys/server.crt')
      });
    }
    if (typeof app.file === 'function') startServer(app, securePort);
    else listeners.push(app.listen.bind(app, securePort));
    secureApp = app;
  }

  return {
    secureApp: secureApp,
    app: normalApp,
    listen: () => {
      listeners.forEach(l => l());
    },
    close: () => {
      secureApp && secureApp.close && secureApp.close();
      normalApp && normalApp.close && normalApp.close();
    }
  };
};
