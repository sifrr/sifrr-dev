const writeCoverage = require('./writecoverage');
const puppeteer = require('puppeteer');

async function writePageCoverage(p, nycReport) {
  /* istanbul ignore next */
  const jsCoverage = await p.evaluate(() => window.__coverage__);
  writeCoverage(jsCoverage, nycReport, 'browser-coverage');
}

function setPageForCoverage(p, nycReport) {
  p.goto = async (url, options) => {
    await writePageCoverage(p, nycReport);
    return p.mainFrame().goto(url, options);
  };

  p._close = p.close;
  p.close = async () => {
    await writePageCoverage(p, nycReport);
    return p._close();
  };
}

module.exports = async function(coverage, nycReport, browserWSEndpoint) {
  let browser;
  if (!global.browser) {
    if (typeof browserWSEndpoint === 'string') {
      browser = global.browser = await puppeteer.connect({
        browserWSEndpoint,
        ignoreHTTPSErrors: true
      });
    } else {
      browser = global.browser = await puppeteer.launch({
        // to make it work in ci
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
        headless: process.env.HEADLESS !== 'false',
        devtools: false
      });
    }

    if (coverage && nycReport) {
      browser.__newPage = browser.newPage;
      browser.newPage = async () => {
        const p = await browser.__newPage();
        setPageForCoverage(p, nycReport);
        return p;
      };

      browser.__close = browser.close;
      browser.close = async () => {
        const pages = await browser.pages();
        for (let i = 0; i < pages.length; i++) {
          await pages[i].close();
        }
        return browser.__close();
      };
    }
  } else {
    browser = global.browser;
  }
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  if (!global.page) global.page = page;

  return {
    browser,
    page
  };
};
