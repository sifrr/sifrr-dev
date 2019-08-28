const path = require('path');
const deepMerge = require('../deepmerge');

module.exports = (testOptions, parallel) => {
  global.__pdescribes = [];
  global.ENV = process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  global.Mocha = require('mocha');
  global.chai = require('chai');
  global.sinon = global.sinon || require('sinon').createSandbox();
  global.assert = chai.assert;
  global.expect = chai.expect;
  global.should = chai.should();
  global.delay = time => {
    return new Promise(res => {
      setTimeout(function() {
        res();
      }, time);
    });
  };
  global.pdescribe = function(filename, name, fxn) {
    if (typeof filename === 'string' && testOptions && !testOptions.parallel && parallel) {
      const newOpts = deepMerge({}, testOptions);
      deepMerge(newOpts, {
        browserWSEndpoint: global.browser ? global.browser.wsEndpoint() : undefined,
        filters: [filename],
        parallel: true,
        junitXmlFile: path.join(
          testOptions.junitXmlFile,
          `../../${path.basename(filename).replace('.test.js', '')}/results.xml`
        ),
        port: 'random'
      });
      global.__pdescribes.push(require('./parallel')([newOpts]));
    } else {
      describe(name, fxn);
    }
  };

  chai.use(require('chai-as-promised'));
};
