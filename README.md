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
| Normal (`dist/sifrr.dev.js`)                 |                   [![Normal](https://img.badgesize.io/sifrr/sifrr-dev/master/dist/sifrr.dev.js?maxAge=600)](https://github.com/sifrr/sifrr-dev/blob/master/dist/sifrr.dev.js)                    |
| Minified (`dist/sifrr.dev.min.js`)           |              [![Minified](https://img.badgesize.io/sifrr/sifrr-dev/master/dist/sifrr.dev.min.js?maxAge=600)](https://github.com/sifrr/sifrr-dev/blob/master/dist/sifrr.dev.min.js)               |
| Minified + Gzipped (`dist/sifrr.dev.min.js`) | [![Minified + Gzipped](https://img.badgesize.io/sifrr/sifrr-dev/master/dist/sifrr.dev.min.js?compression=gzip&maxAge=600)](https://github.com/sifrr/sifrr-dev/blob/master/dist/sifrr.dev.min.js) |

## Tools

- `getRollupConfig` Rollup configs to bundle JavaScripts for node packages, es modules and browser packs.
- `generateChangelog` Generate Changelog during release
- `loadDir` Load directory recursively
- `eslintrc` ESLint config and prettier
- `deepMerge` Deep Merge Objects
- `checkTag` check if a tag exists on github
- `exec` async execute a shell command with stdout and stderr
- `gitAddCommitPush` run command > git add files > git commit > git push
- `runTests` Run a full fledged test suite using mocha, chai, sinon, puppeteer, etc.

## Other packages

- [@commitlint/cli](https://github.com/conventional-changelog/commitlint) - Linting commits
- [Husky](https://github.com/typicode/husky) - Git hooks made easy
- [browserslist](https://github.com/browserslist/browserslist#readme) - browserlist used by babel, eslint, postcss, etc.
- [coveralls](https://github.com/nickmerwin/node-coveralls#readme) - upload coverage to coveralls.io
- [mock-require](https://github.com/boblauer/mock-require) - Simple, intuitive mocking of Node.js modules.

## Usage

### Husky

Just add `.huskyrc` and you are good to go.

### ESlint

Add this to your `eslintrc` config

```js
{
  extends: ['sifrr']
}
```

and add pre-commit hook in your `.huskyrc`

```json
{
  "hooks": {
    "pre-commit": "yarn eslint --fix \"src/**/*.js\" && git add -A"
  }
}
```

sifrr eslint config extends prettier config and plugin, you can add `prettier.config.js` if you want to change default options for prettier.

### commitlint

add commit-msg hook in your `.huskyrc`

```rc
{
  "hooks": {
    "commit-msg": "yarn commitlint -e $HUSKY_GIT_PARAMS"
  }
}
```

add `commitlint.config.js` to your root folder

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

### Upload coverage to Coveralls

set `COVERALLS_REPO_TOKEN` environment variable, run tests with `lcov` reporter, Upload with this command:

```sh
cat ./coverage/lcov.info | yarn coveralls
```

### Eslint

Add tihs to your `.eslintrc.js`

```js
module.exports = {
  extends: ['sifrr']
};
```

### Prettier

Add `prettier.config.js`, and it will be picked by eslint. Add prettier extension in code editor you use for best use.
