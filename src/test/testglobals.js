const deepMerge = require('../deepmerge');

function getCaller() {
  try {
    let err = new Error();
    let callerfile;
    let currentfile;

    Error.prepareStackTrace = function (err, stack) { return stack; };

    currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();

      if(currentfile !== callerfile) return callerfile;
    }
  } catch (err) {
    // do nothing
  }
  return undefined;
}

module.exports = (mochaOptions) => {
  global.__tps = [Promise.resolve(0)];
  global.ENV = process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  global.Mocha = require('mocha');
  global.chai = require('chai');
  global.sinon = global.sinon || require('sinon').createSandbox();
  global.assert = chai.assert;
  global.expect = chai.expect;
  global.should = chai.should();
  global.delay = (time) => {
    return new Promise(res => {
      setTimeout(function(){
        res();
      }, time);
    });
  };
  global.pdescribe = function(name, fxn) {
    const testFile = getCaller();
    if (testFile && mochaOptions && !mochaOptions.parallel) {
      const newOpts = deepMerge({}, mochaOptions);
      deepMerge(newOpts, { filters: [testFile], parallel: true, port: 'random' });
      global.__tps.push(require('./parallel')([newOpts], true));
    } else {
      describe(name, fxn);
    }
  };

  chai.use(require('chai-as-promised'));
};
