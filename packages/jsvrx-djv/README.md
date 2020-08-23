# jsvrx-djv

RxJS operators to validate/discriminate data objects using [JSON Schema(s)](https://json-schema.org/) and [Dynamic JSON Schema Validator](https://cli-in-ts.dev/djv/).

[![Build Status](https://travis-ci.com/Gadicuz/jsvrx.svg?branch=master)](https://travis-ci.com/Gadicuz/jsvrx)
[![Coverage Status](https://coveralls.io/repos/github/Gadicuz/jsvrx/badge.svg?branch=master)](https://coveralls.io/github/Gadicuz/jsvrx?branch=master)
[![npm](https://img.shields.io/npm/v/jsvrx-djv)](https://www.npmjs.com/package/jsvrx-djv)
[![djv](https://img.shields.io/github/package-json/dependency-version/gadicuz/jsvrx-djv/dev/djv)](https://www.npmjs.com/package/djv)
[![npm bundle size](https://img.shields.io/bundlephobia/min/jsvrx-djv)](https://bundlephobia.com/result?p=jsvrx-djv)
[![Top Language](https://img.shields.io/github/languages/top/gadicuz/jsvrx)](https://github.com/gadicuz/jsvrx)
![MIT License](https://img.shields.io/npm/l/jsvrx-djv)

# Install

```bash
npm i jsvrx-djv
```

Install [Djv](https://www.npmjs.com/package/djv) if you don't have it installed already.

```bash
npm i djv
```

# Usage

`DjvDataValidtor` is `DataValidator` interface implementation using [Djv](https://cli-in-ts.dev/djv/).

For more information about `DataValidation` interface and usage examples see [jsvrx](https://www.npmjs.com/package/jsvrx).

Create a new `DjvDataValidator` instance by passing a `djv` instance as the constructor's parameter.

```typescript
import djv from 'djv';
import { DjvDataValidator } from { jsvrx-djv }
const djvVD = new djv();
djvVD.useVersion('draft-06');
const dv = new DjvDataValidator(djvVD);
```

`DjvDataValidator.discriminator(ids: JSONSchemaID[], inv?: JSONSchemaID)` implementation doesn't provide optimized validation for multiple JSON Schemas. It executes single JSON Schema validation attempts in `ids` array order. Fill the `ids` array accordingly.

