const path = require('path');

const writeCoverage = require('./writecoverage');
const puppeteer = require('puppeteer');

module.exports = async function(root, coverage) {
  if (global.browser) await global.browser.close();
  // set browser and page global variables
  const browser = await puppeteer.launch({
    // to make it work in circleci
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS !== 'false',
    devtools: false
  });
  const page = await browser.newPage();
  const nycReport = path.join(root, './.nyc_output');

  await page.setViewport( { width: 1280, height: 800 } );

  function setPageGoto(page) {
    page.goto = async (url, options) => {
      const jsCoverage = await page.evaluate(() => window.__coverage__);
      writeCoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
      const ret = page.mainFrame().goto(url, options);
      return ret;
    };
  }

  if (coverage) {
    browser.__newPage = browser.newPage;
    browser.newPage = async () => {
      const p = await browser.__newPage();
      setPageGoto(p);
    };

    browser.__close = browser.close;
    browser.close = async () => {
      const jsCoverage = await page.evaluate(() => window.__coverage__);
      writeCoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
      return browser.__close();
    };

    setPageGoto(page);
  }

  global.browser = browser;
  global.page = page;

  return {
    browser,
    page
  };
};
