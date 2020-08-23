# jsvrx-monorepo

A monorepo for `DataValidator` interface and it's implementations. 

`DataValidator` interface defines methods to create RxJS operators that are used to validate/discriminate data objects using JSON Schema(s).

The monorepo contains the following packages:

* [jsvrx](packages/jsvrx/README.md) - `DataValidator` declaration
* [jsvrx-ajv](packages/jsvrx-ajv/README.md) - `DataValidator` implementation using [Ajv](https://ajv.js.org/)
* [jsvrx-djv](packages/jsvrx-djv/README.md) - `DataValidator` implementation using [Djv](https://cli-in-ts.dev/djv/)

