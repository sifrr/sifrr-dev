module.exports = () => {
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
      }, time * 1000);
    });
  };

  chai.use(require('chai-as-promised'));
};
