describe('Test Server', () => {
  it('hosts public folder', async () => {
    await page.goto(`${PATH}/test.html`);
    expect(await page.content()).to.have.string('OK');
  });

  it('hosts dist folder', async () => {
    await page.goto(`${PATH}/sifrr.dev.js`);
    expect(await page.content()).to.have.string('sifrr');
    if (process.env.COVERAGE === 'true') expect(await page.content()).to.have.string('cov_');
  });
});