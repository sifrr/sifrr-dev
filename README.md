# sifrr-dev · [![npm version](https://img.shields.io/npm/v/@sifrr/dev.svg)](https://www.npmjs.com/package/@sifrr/dev)

<p align="center">
  <a href="https://github.com/sifrr/sifrr-dev/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="GitHub license" /></a>
  <a href="https://circleci.com/gh/sifrr/sifrr-dev"><img alt="CircleCI" src="https://img.shields.io/circleci/project/github/sifrr/sifrr-dev/master.svg?logo=circleci&style=flat-square" /></a>
  <a href="https://coveralls.io/github/sifrr/sifrr-dev?branch=master"><img src="https://img.shields.io/coveralls/github/sifrr/sifrr-dev.svg?style=flat-square" alt="Coverage Status" /></a>
  <a href="https://dependabot.com/"><img src="https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot" alt="Dependabot badge" /></a>
</p>

> Development tools for sifrr packages, webapps

## Size

| Type                                         |                                                                                               Size                                                                                               |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| Normal (`dist/sifrr.dev.js`)                 |                    [![Normal](https://img.badgesize.io/sifrr/sifrr-dev/master/dist/sifrr.dev.js?maxAge=600)](https://github.com/sifrr/sifrr-dev/blob/master/dist/sifrr.dev.js)                   |
| Minified (`dist/sifrr.dev.min.js`)           |               [![Minified](https://img.badgesize.io/sifrr/sifrr-dev/master/dist/sifrr.dev.min.js?maxAge=600)](https://github.com/sifrr/sifrr-dev/blob/master/dist/sifrr.dev.min.js)              |
| Minified + Gzipped (`dist/sifrr.dev.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr-dev/master/dist/sifrr.dev.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr-dev/blob/master/dist/sifrr.dev.min.js) |

## Tools

-   `getRollupConfig` Rollup configs to bundle JavaScripts to use in node, es modules or browser.
-   `generateChangelog` Generate Changelog during release
-   `loadDir` Load directory recursively
-   `eslintrc` ESLint config
-   `deepMerge` Deep Merge Objects
-   `checkTag` check if a tag exists on github
-   `exec` async execute a shell command with stdout and stderr
-   `gitAddCommitPush` run command > git add files > git commit > git push
-   `runTests` Run a full fledged test suite using mocha, chai, sinon, puppeteer, etc.

## Other packages

- [@commitlint/cli](https://github.com/conventional-changelog/commitlint) - Linting commits
- [Husky](https://github.com/typicode/husky) - Git hooks made easy
- [browserslist](https://github.com/browserslist/browserslist#readme)
- [coveralls](https://github.com/nickmerwin/node-coveralls#readme) - upload coverage to coveralls.io
- [mock-require](https://github.com/boblauer/mock-require) - Simple, intuitive mocking of Node.js modules.

