const path = require('path');

const writeCoverage = require('./writecoverage');
const puppeteer = require('puppeteer');

function setPageGoto(p, nycReport) {
  p.goto = async (url, options) => {
    /* istanbul ignore next */
    const jsCoverage = await p.evaluate(() => window.__coverage__);
    writeCoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
    const ret = p.mainFrame().goto(url, options);
    return ret;
  };
}

module.exports = async function(root, coverage, nycReport = path.join(root, './.nyc_output')) {
  let browser;
  if (!global.browser) {
    browser = global.browser =await puppeteer.launch({
      // to make it work in circleci
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      ignoreHTTPSErrors: true,
      headless: process.env.HEADLESS !== 'false',
      devtools: false
    });

    if (coverage) {
      browser.__newPage = browser.newPage;
      browser.newPage = async () => {
        const p = await browser.__newPage();
        setPageGoto(p, nycReport);
      };

      browser.__close = browser.close;
      browser.close = async () => {
        /* istanbul ignore next */
        const jsCoverage = await page.evaluate(() => window.__coverage__);
        writeCoverage(jsCoverage, path.join(nycReport, `./${Date.now()}-browser-coverage.json`));
        return browser.__close();
      };
    }
  } else {
    browser = global.browser;
  }
  // set browser and page global variables
  const page = await browser.newPage();
  await page.setViewport( { width: 1280, height: 800 } );

  if (!global.page) global.page = page;

  return {
    browser,
    page
  };
};
