const spawn = require('child_process').spawn;
const execa = require('child_process').exec;

function exec(command, options = {}) {
  process.stdout.write(`Running command: ${command} \n`);
  if (command.indexOf('sh') === 0) {
    options.stdio = options.stdio || 'inherit';
    return new Promise((res, rej) => {
      const [c, ...args] = command.split(' ');
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
