## [0.0.17](https://github.com/sifrr/sifrr-dev/compare/v0.0.16...v0.0.17) (2019-07-04)



## 0.0.17 (2019-07-04 23:35:36 +0900)


### Bug Fixes

* don't use babel register ([96724e7](https://github.com/sifrr/sifrr-dev/commit/96724e7))


### Features

* add replace plugin for node, browser, module ([508579e](https://github.com/sifrr/sifrr-dev/commit/508579e))
* resolve test run with coverage data as well ([cd6da95](https://github.com/sifrr/sifrr-dev/commit/cd6da95))
* resolve with number of failures instead of rejecting ([4ad5909](https://github.com/sifrr/sifrr-dev/commit/4ad5909))



## [0.0.16](https://github.com/sifrr/sifrr-dev/compare/v0.0.15...v0.0.16) (2019-06-27 08:01:19 +0000)


### Features

* use babel istanbul plugin to instrument source code ([33b68a3](https://github.com/sifrr/sifrr-dev/commit/33b68a3))



## [0.0.15](https://github.com/sifrr/sifrr-dev/compare/v0.0.14...v0.0.15) (2019-06-27 06:40:10 +0000)


### Bug Fixes

* only transpile source files and test files using babel ([b7c4a43](https://github.com/sifrr/sifrr-dev/commit/b7c4a43))



## [0.0.14](https://github.com/sifrr/sifrr-dev/compare/v0.0.13...v0.0.14) (2019-06-27 06:18:48 +0000)


### Features

* add named exports and external to rollup config ([efb27bb](https://github.com/sifrr/sifrr-dev/commit/efb27bb))
* add typescript support ([6b7e376](https://github.com/sifrr/sifrr-dev/commit/6b7e376))
* replace eslint-config-sifrr with @sifrr/eslint-config ([efe75e5](https://github.com/sifrr/sifrr-dev/commit/efe75e5))
* support multiple types in getRollupConfig ([48bb791](https://github.com/sifrr/sifrr-dev/commit/48bb791))



## [0.0.13](https://github.com/sifrr/sifrr-dev/compare/v0.0.12...v0.0.13) (2019-06-25 09:06:36 +0000)


### Features

* separate eslint-config-sifrr package ([6a671fb](https://github.com/sifrr/sifrr-dev/commit/6a671fb))



## [0.0.12](https://github.com/sifrr/sifrr-dev/compare/v0.0.11...v0.0.12) (2019-06-25 06:12:22 +0000)


### Features

* add eslint compat plugin ([a72dc0a](https://github.com/sifrr/sifrr-dev/commit/a72dc0a))
* add prettier to eslint ([b062619](https://github.com/sifrr/sifrr-dev/commit/b062619))
* add shareable eslint config ([56bf370](https://github.com/sifrr/sifrr-dev/commit/56bf370))
* remove compat as it doesn't work with node ([6da99a8](https://github.com/sifrr/sifrr-dev/commit/6da99a8))
* use babel-eslint parser ([b419064](https://github.com/sifrr/sifrr-dev/commit/b419064))



## [0.0.11](https://github.com/sifrr/sifrr-dev/compare/v0.0.10...v0.0.11) (2019-06-15 14:32:16 +0000)


### Bug Fixes

* ignore https certificate in puppeteer connection ([a264b3b](https://github.com/sifrr/sifrr-dev/commit/a264b3b))


### Features

* add explicit option to run tests parallely ([c53b59d](https://github.com/sifrr/sifrr-dev/commit/c53b59d))
* add option to share browser instance between parallel tests ([e2bd85f](https://github.com/sifrr/sifrr-dev/commit/e2bd85f))
* share browser instance between parallel tests ([06103b5](https://github.com/sifrr/sifrr-dev/commit/06103b5))



## [0.0.10](https://github.com/sifrr/sifrr-dev/compare/v0.0.9...v0.0.10) (2019-06-13 06:08:06 +0000)


### Features

* count pdescribe's failures in main failures ([e428592](https://github.com/sifrr/sifrr-dev/commit/e428592))



## [0.0.9](https://github.com/sifrr/sifrr-dev/compare/v0.0.8...v0.0.9) (2019-06-11 17:00:25 +0000)


### Bug Fixes

* don't instrument test code ([1aefff2](https://github.com/sifrr/sifrr-dev/commit/1aefff2))


### Features

* add pdescribe that runs single test suite in parallel ([88327d9](https://github.com/sifrr/sifrr-dev/commit/88327d9))
* run precommands before running parallel tests ([27320e6](https://github.com/sifrr/sifrr-dev/commit/27320e6))
* select random port for testing if port == 'random' ([a09fdaa](https://github.com/sifrr/sifrr-dev/commit/a09fdaa))
* test will run parallelly if array of options is given ([4a68637](https://github.com/sifrr/sifrr-dev/commit/4a68637))
* unique converage filenames with hex sha1 suffix ([2c0a18a](https://github.com/sifrr/sifrr-dev/commit/2c0a18a))
* use json-fn for serializing data ([9c7ebcd](https://github.com/sifrr/sifrr-dev/commit/9c7ebcd))



## [0.0.8](https://github.com/sifrr/sifrr-dev/compare/v0.0.7...v0.0.8) (2019-06-07 08:15:24 +0000)


### Bug Fixes

* return page on newPage when coverage is true ([952ae5b](https://github.com/sifrr/sifrr-dev/commit/952ae5b))


### Features

* add mochaOptions to runTests ([39568b0](https://github.com/sifrr/sifrr-dev/commit/39568b0))
* close browser, coverage even if errors ([c6ced54](https://github.com/sifrr/sifrr-dev/commit/c6ced54))
* don't force exit on test completion ([56a0b31](https://github.com/sifrr/sifrr-dev/commit/56a0b31))
* don't replace globals if already present on loadBrowser ([dbb58c2](https://github.com/sifrr/sifrr-dev/commit/dbb58c2))
* write coverage on page close, browser close ([5f8e1a4](https://github.com/sifrr/sifrr-dev/commit/5f8e1a4))



## [0.0.7](https://github.com/sifrr/sifrr-dev/compare/v0.0.6...v0.0.7) (2019-06-06 09:34:35 +0000)


### Bug Fixes

* hook require before running any commands ([4135808](https://github.com/sifrr/sifrr-dev/commit/4135808))



## [0.0.6](https://github.com/sifrr/sifrr-dev/compare/v0.0.5...v0.0.6) (2019-06-06 08:59:31 +0000)


### Bug Fixes

* output last version if ouputunreleased ([30ab08e](https://github.com/sifrr/sifrr-dev/commit/30ab08e))
* sifrr server using same type ([9730c60](https://github.com/sifrr/sifrr-dev/commit/9730c60))


### Features

* add object select ([ba309cb](https://github.com/sifrr/sifrr-dev/commit/ba309cb))
* add option to exec to use spawn manually ([cc5da3a](https://github.com/sifrr/sifrr-dev/commit/cc5da3a))
* start server and browser only if folder exists ([a186892](https://github.com/sifrr/sifrr-dev/commit/a186892))



## [0.0.5](https://github.com/sifrr/sifrr-dev/compare/v0.0.4...v0.0.5) (2019-06-04 18:11:05 +0000)


### Bug Fixes

* reverse merge folders ([248ccca](https://github.com/sifrr/sifrr-dev/commit/248ccca))
* support esModules in instrumenting ([88dc940](https://github.com/sifrr/sifrr-dev/commit/88dc940))



## [0.0.4](https://github.com/sifrr/sifrr-dev/compare/v0.0.3...v0.0.4) (2019-06-04 11:26:10 +0000)


### Features

* remove exports named from rollup config ([5480536](https://github.com/sifrr/sifrr-dev/commit/5480536))



## [0.0.3](https://github.com/sifrr/sifrr-dev/compare/v0.0.2...v0.0.3) (2019-06-04 10:46:18 +0000)


### Bug Fixes

* merging coverage reports was not working properly ([2bc588e](https://github.com/sifrr/sifrr-dev/commit/2bc588e))



## [0.0.2](https://github.com/sifrr/sifrr-dev/compare/v0.0.1...v0.0.2) (2019-06-04 10:21:53 +0000)



## [0.0.1](https://github.com/sifrr/sifrr-dev/compare/v0.0.1-rc3...v0.0.1) (2019-06-04 09:08:12 +0000)



## [0.0.1-rc3](https://github.com/sifrr/sifrr-dev/compare/v0.0.1-rc2...v0.0.1-rc3) (2019-06-04 07:55:59 +0000)


### Bug Fixes

* fix fs and path in write coverage ([db3f13d](https://github.com/sifrr/sifrr-dev/commit/db3f13d))


### Features

* add checktag and exec ([d02ad18](https://github.com/sifrr/sifrr-dev/commit/d02ad18))
* add conventional changelog generate function ([ac7066a](https://github.com/sifrr/sifrr-dev/commit/ac7066a))
* add coverage reporters ([66f7647](https://github.com/sifrr/sifrr-dev/commit/66f7647))
* add gitAddCommitPush ([1c3debb](https://github.com/sifrr/sifrr-dev/commit/1c3debb))
* add html and css imports in rollup ([d3cf370](https://github.com/sifrr/sifrr-dev/commit/d3cf370))
* add onDir function to loadDir ([72cae5e](https://github.com/sifrr/sifrr-dev/commit/72cae5e))
* add release tag ([d73f867](https://github.com/sifrr/sifrr-dev/commit/d73f867))
* add test runner ([dafcacc](https://github.com/sifrr/sifrr-dev/commit/dafcacc))



## [0.0.1-rc2](https://github.com/sifrr/sifrr-dev/compare/72d3a3c...v0.0.1-rc2) (2019-05-30 10:39:49 +0000)


### Bug Fixes

* pass merge array deeply ([d1296a6](https://github.com/sifrr/sifrr-dev/commit/d1296a6))


### Features

* add getRollupConfig function ([d4ed48b](https://github.com/sifrr/sifrr-dev/commit/d4ed48b))
* add loaddir and eslintrc ([72d3a3c](https://github.com/sifrr/sifrr-dev/commit/72d3a3c))
* add option to merge array in deepMerge ([672e540](https://github.com/sifrr/sifrr-dev/commit/672e540))



