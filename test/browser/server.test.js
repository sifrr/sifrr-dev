describe('Test Server', () => {
  it('hosts public folder', async () => {
    await page.goto(`${PATH}/test.html`);
    expect(await page.content()).to.have.string('OK');

    await page.goto(`${SPATH}/test.html`);
    expect(await page.content()).to.have.string('OK');
  });

  it('hosts dist folder', async () => {
    await page.goto(`${PATH}/sifrr.dev.cjs.js`);
    expect(await page.content()).to.have.string('sifrr');
    if (process.env.COVERAGE === 'true') expect(await page.content()).to.have.string('cov_');

    await page.goto(`${SPATH}/sifrr.dev.cjs.js`);
    expect(await page.content()).to.have.string('sifrr');
    if (process.env.COVERAGE === 'true') expect(await page.content()).to.have.string('cov_');
  });

  it('hosts extra static folders', async () => {
    await page.goto(`${PATH}/run.js`);
    expect(await page.content()).to.have.string('test');

    await page.goto(`${SPATH}/run.js`);
    expect(await page.content()).to.have.string('test');
  });

  it('secure path has https', () => {
    expect(PATH).to.not.have.string('https');
    expect(PATH).to.have.string('http');
    expect(SPATH).to.have.string('https');
  });
});
