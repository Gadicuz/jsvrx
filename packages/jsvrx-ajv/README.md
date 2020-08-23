# jsvrx-ajv

RxJS operators to validate/discriminate data objects using [JSON Schema(s)](https://json-schema.org/) and [Ajv: Another JSON Schema Validator](https://ajv.js.org/).

[![Build Status](https://travis-ci.com/Gadicuz/jsvrx.svg?branch=master)](https://travis-ci.com/Gadicuz/jsvrx)
[![Coverage Status](https://coveralls.io/repos/github/Gadicuz/jsvrx/badge.svg?branch=master)](https://coveralls.io/github/Gadicuz/jsvrx?branch=master)
[![npm](https://img.shields.io/npm/v/jsvrx-ajv)](https://www.npmjs.com/package/jsvrx-ajv)
[![ajv](https://img.shields.io/github/package-json/dependency-version/gadicuz/jsvrx/dev/ajv)](https://www.npmjs.com/package/ajv)
[![npm bundle size](https://img.shields.io/bundlephobia/min/jsvrx-ajv)](https://bundlephobia.com/result?p=jsvrx-ajv)
[![Top Language](https://img.shields.io/github/languages/top/gadicuz/jsvrx)](https://github.com/gadicuz/jsvrx)
![MIT License](https://img.shields.io/npm/l/jsvrx-ajv)

# Install

```bash
npm i jsvrx-ajv
```

Install [Ajv](https://www.npmjs.com/package/ajv) if you don't have it installed already.

```bash
npm i ajv
```

# Usage

`AjvDataValidtor` is a `DataValidator` interface implementation using [Ajv](https://ajv.js.org/).

For more information about `DataValidation` interface and usage examples see [jsvrx](https://www.npmjs.com/package/jsvrx).

Create a new `AjvDataValidator` instance using `ajv.Options` or pass an `ajv` instace as the constructor's parameter.

```typescript
import { AjvDataValidator } from 'jsvrx-ajv';
const dv = new AjvDataValidator({ coerceTypes: true })

import ajv from 'ajv';
const dv = new AjvDataValidator(new ajv())
```

`AjvDataValidator.discriminator()` implementation doesn't provide optimized validation for multiple JSON Schemas. It executes single JSON Schema validation attempts in `ids` array order. Fill the `ids` array accordingly.

`ValidationError.e` holds `ajv.ValidateFunction.errors` for the __validator__ error and array of `ajv.ValidateFunction.errors` for the __discriminator__ error.

