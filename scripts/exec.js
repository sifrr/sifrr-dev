#!/usr/bin/env node

const execa = require('child_process').exec;

function execAsync(command, options = {}) {
  return new Promise((res, rej) => {
    execa(command, options, (err, stdout, stderr) => {
      if (err !== null) {
        process.stdout.write(`Error: ${err}`);
        rej(err);
      }
      res({ stdout, stderr });
    });
  });
}

module.exports =  execAsync;
