# jsvrx

RxJS operators to validate/discriminate data objects using [JSON Schema(s)](https://json-schema.org/).

[![Build Status](https://travis-ci.com/Gadicuz/jsvrx.svg?branch=master)](https://travis-ci.com/Gadicuz/jsvrx)
[![Coverage Status](https://coveralls.io/repos/github/Gadicuz/jsvrx/badge.svg?branch=master)](https://coveralls.io/github/Gadicuz/jsvrx?branch=master)
[![npm](https://img.shields.io/npm/v/jsvrx)](https://www.npmjs.com/package/jsvrx)
[![rxjs](https://img.shields.io/github/package-json/dependency-version/gadicuz/jsvrx/dev/rxjs)](https://www.npmjs.com/package/rxjs)
[![Code Size](https://img.shields.io/github/languages/code-size/gadicuz/jsvrx)](https://github.com/gadicuz/jsvrx)
[![Top Language](https://img.shields.io/github/languages/top/gadicuz/jsvrx)](https://github.com/gadicuz/jsvrx)
[![MIT License](https://img.shields.io/github/license/gadicuz/jsvrx)](https://github.com/Gadicuz/jsvrx/blob/master/LICENSE)


# Features

* Basic `DataValidator` interface to validate/discriminate data objects
  * __validate__ a data object using single JSON Schema
  * __discriminate__ a data object using set of JSON Schemas
* Data validation and JSON Schema procesing are provided by well known packages:
  * [Ajv: Another JSON Schema Validator](https://ajv.js.org/) - `AjvDataValidator`
  * [Dynamic JSON Schema Validator](https://cli-in-ts.dev/djv/) - `DjvDataValidator`
  * _a custom provider_
* Compatible with standard [RxJS 6](https://github.com/ReactiveX/rxjs/tree/6.x) data processing
* ECMAScript module, typings available

# Install

```bash
npm i jsvrx
```

# Usage

The package provides basic `DataValidator` interface to validate/discriminate data objects and handful implementations of the interface based on popular libraries.

`DataValidator` inteface constructs validators and discriminators to use in RxJS data stream processing to validate unknown data object or produce new data streams based on validation results using a set of JSON Schemas.

## DataValidator interface

`DataValidator` interface provides methods to add JSON Schemas and to construct __validator__ and __dicriminator__ RxJS operators for a set of Schema ids. To start processing data is RxJS stream one can take the following steps:
1. Instantiate an implementation of `DataValidator` interface;
2. Add required JSON Schema using `addSchemas()` method or by other means provided. Every schema should have an unique _identifier_ that is used to refernce the schema in `validator()` and `discriminator()` methods.
3. Get required RxJS operator for a set of JSON Schema _identifiers_ using `validator()` or `discriminator()` methods.
4. Use the operator in RxJS data processing `pipe()`.

### Validator

A __validator__ operator uses single JSON Schema to validate data objects and throw an error if failed. Consider __discriminator__ operator if multiple JSON Schemas validation or custom error handling required.

`validator(id: JSONSchemaID)` constructs RxJS operator to validate data objects using JSON Schema selected by `id`. If validation fails a `ValidationError()` error is thrown.

The operator returns [Observable](https://rxjs.dev/api/index/class/Observable). 

### Discriminator

A __discriminator__ operator uses set of JSON Schemas to validate data objects and creates new RxJS output data streams. Every input object is validated and placed in the output data stream according to the object's validated type. Invalid objects are placed in dedicated output data stream.

`discriminator(ids: JSONSchemaID[], inv?: JSONSchemaID)` constructs RxJS operator to discriminate data objects using a set of JSON Schemas defined by `ids` array. Validated objects are grouped by JSON Schema and are marked with the schema's id, invalid objects are reported in a group marked with `inv` value. If validation fails and `inv` is not set a `ValidationError()` error is thrown.

The operator returns [GroupedObservable](https://rxjs.dev/api/index/class/GroupedObservable) for every unique schema id.

| input object | `GroupedObservable.key` value |
| --- | --- |
| Validated by JSON schema `id` | `id` |
| Invalid and `inv` parameter is present | `inv` |
| Invalid and `inv` parameter is absent | n/a, `ValidationError` is thrown |

### Typing

`DataValidator` interface provides typing information for `validator` and `discriminator` methods using [generics](https://www.typescriptlang.org/docs/handbook/generics.html).

```typescript
validator<T>(...): OperatorFunction<unknown, T>

T is unknown by default.
```

It's possible to create a _JSON Schema -> Type_ mapping type to control __discriminator__ operator typing.

```typescript
// IDx - JSON schema ids, Tx - corresponding typescript types
type M = { ID1: T1, ID2: T2 }; 

discriminator<M>(...): OperatorFunction<
  unknown, 
  GroupedObservable<ID1 | ID2, T1 | T2>
>

discriminator<M, true>(...): OperatorFunction<
  unknown,
  GroupedObservable<ID1, T1> | GroupedObservable<ID2, T2>>
>

M is { [JSONSchemaID]: unknown } by default.

discriminator<>(...): OperatorFunction<
  unknown, 
  GroupedObservable<string, unknown>
>
```

## Ajv provider

[![ajv](https://img.shields.io/github/package-json/dependency-version/gadicuz/jsvrx/dev/ajv)](https://www.npmjs.com/package/ajv)

`AjvDataValidtor` is a `DataValidator` interface implementation using [Ajv](https://ajv.js.org/).

Create new `AjvDataValidator` instance with `ajv.Options` or pass an `ajv` instace as the constructor's parameter.

```typescript
import ajv from 'ajv';
const dv = new AjvDataValidator({ coerceTypes: true })
const dv = new AjvDataValidator(new ajv())
```

`AjvDataValidator.discriminator()` implementation doesn't provide optimized validation for multiple JSON Schemas. It executes signle JSON Schema validation attempts in `ids` array order. Fill `ids` array accordingly.

`ValidationError.e` holds `ajv.ValidateFunction.errors` for the __validator__ error and array of `ajv.ValidateFunction.errors` for the __discriminator__ error.

## Djv provider

[![djv](https://img.shields.io/github/package-json/dependency-version/gadicuz/jsvrx/dev/djv)](https://www.npmjs.com/package/djv)

`DjvDataValidtor` is a `DataValidator` interface implementation using [Djv](https://cli-in-ts.dev/djv/).

Create new `DjvDataValidator` instance passing an `djv` instace as the constructor's parameter.

```typescript
import djv from 'djv';
const djvVD = new djv();
djvVD.useVersion('draft-06');
const dv = new DjvDataValidator(djvVD);
```

`DjvDataValidator.discriminator()` implementation doesn't provide optimized validation for multiple JSON Schemas. It executes signle JSON Schema validation attempts in `ids` array order. Fill `ids` array accordingly.

## Implement a custom provider

The package declares two functions to help implementing custom provider `DataValidator` interface:
* `validator<T>(validate: (obj: unknown) => T)): OperatorFunction<>`
* `discriminator(discriminate: (obj: unknown) => JSONSchemaID)) OperatorFunction<>`

Both functions with a projector provided as an parameter return correct RxJS operator to implement `DataValidator` interface requirements.

To desing a custom provider:
1. Declare a class that implements `DataValidator` interface.
2. Desing a custom constructor method.
3. Implement `addSchemas(schemas: JSONSchema[])` method.
4. In `validator(id: JSONSchemaID)` method implementation define a functions that validates unknown object with JSONSchema. Return helper `validator()` with the function as the parameter.
5. In `discriminator(ids: JSONSchemaID[], inv?: JSONSchemaID)` method implementation define a functions that validates unknown object with set of JSONSchemas and choose the schema id or `inv` value. Return helper `discriminator()` with the function as the parameter.

# Examples

### Parse string and validate objects array

```typescript
const data: string = ...; // JSON encoded array of objects T
const schema: JSONSchema = { $id: 'SCHEMA', ... }; // JSON Schema of type T

const dv = new aDataValidator();
dv.addSchemas([schema]);

of(data).pipe(
  map((s) => JSON.Parse(s)),
  mergeMap((arr) => from(arr)),
  dv.validate(schema.$id)
); // <-- Observable<T>
```

### Parse string and discriminate object array

```typescript
const data: string = ...; // JSON encoded array of objects
const schemas: JSONSchema[] = [...]; // JSON Schemas of types in data

const dv = new aDataValidator();
dv.addSchemas(schemas);

of(data).pipe(
  map((s) => JSON.Parse(s)),
  switchMap((arr) => from(arr)),
  dv.discriminate(schemas.map((s) => s.$id), 'invalid'),
  mergeMap((group) => 
    group.pipe(
      // Processing specific to object validated by JSON Schema group.key
      toArray(),
      map((arr) => ({ [group.key]: arr }))
    )
  )
  reduce((acc, g) => ({ ...acc, ...g }), {} as Record<string, unknown[]>)
); // <-- Observable<{ ID1: [...], ID2: [...], ... , invalid: [...] }>
```
