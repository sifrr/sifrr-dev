const execa = require('child_process').exec;

function exec(command, options = {}) {
  return new Promise((res, rej) => {
    execa(command, options, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(`out: ${stdout}`);
      if (stderr) process.stderr.write(`err: ${stderr}`);
      if (err !== null) {
        process.stderr.write(`exec error: ${err}`);
        rej(err);
      }
      res({ stdout, stderr });
    });
  });
}

module.exports =  exec;
