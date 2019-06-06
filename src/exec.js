const spawn = require('child_process').spawn;
const execa = require('child_process').exec;

const splitRegex = /((?:["'][^"]+["'])|(?:[^ ]+))/;

function exec(command, options = {}) {
  if (command.indexOf('sh ') === 0 || options.spawn) {
    process.stdout.write(`Running command: ${command} with spawn \n`);
    options.stdio = options.stdio || 'inherit';
    return new Promise((res, rej) => {
      const [c, ...args] = command.split(splitRegex).filter(x => x.trim() !== '');
      const runner = spawn(c, args, options);
      runner.on('close', (code) => {
        if (code !== 0) {
          process.stdout.write(`Command exited with code ${code}: ${command} \n`);
          rej(code);
        } else {
          process.stdout.write(`Finished command: ${command} \n`);
          res();
        }
      });
    });
  } else {
    process.stdout.write(`Running command: ${command} \n`);
    return new Promise((res, rej) => {
      execa(command, options, (err, stdout, stderr) => {
        if (stdout) process.stdout.write(`out: ${stdout} \n`);
        if (stderr) process.stderr.write(`err: ${stderr} \n`);
        if (err !== null) {
          process.stderr.write(`exec error: ${err}`);
          rej(err);
        }
        res({ stdout, stderr });
        process.stdout.write(`Finished command: ${command} \n`);
      });
    });
  }
}

module.exports =  exec;
