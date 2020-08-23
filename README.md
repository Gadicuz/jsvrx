# jsvrx-monorepo

A monorepo for `DataValidator` interface and it's implementations. 

[![Build Status](https://travis-ci.com/Gadicuz/jsvrx.svg?branch=master)](https://travis-ci.com/Gadicuz/jsvrx)
[![Coverage Status](https://coveralls.io/repos/github/Gadicuz/jsvrx/badge.svg?branch=master)](https://coveralls.io/github/Gadicuz/jsvrx?branch=master)
[![Top Language](https://img.shields.io/github/languages/top/gadicuz/jsvrx)](https://github.com/gadicuz/jsvrx)
[![MIT License](https://img.shields.io/github/license/gadicuz/jsvrx)](https://github.com/Gadicuz/jsvrx/blob/master/LICENSE)

`DataValidator` interface defines methods to create RxJS operators to validate/discriminate data objects using JSON Schema(s).

The monorepo contains the following packages:

* [jsvrx](packages/jsvrx/README.md) - `DataValidator` declaration
* [jsvrx-ajv](packages/jsvrx-ajv/README.md) - `DataValidator` implementation using [Ajv](https://ajv.js.org/)
* [jsvrx-djv](packages/jsvrx-djv/README.md) - `DataValidator` implementation using [Djv](https://cli-in-ts.dev/djv/)

