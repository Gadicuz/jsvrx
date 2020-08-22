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
* Compatible with standard [RxJS 6](https://github.com/ReactiveX/rxjs/tree/6.x) data processing
* ECMAScript module, typings available

# Install

```bash
npm i jsvrx
```

# Usage

Package provides basic `DataValidator` interface to validate/discriminate data objects and handful implementations of the interface based on popular libraries.

## DataValidator interface

`DataValidator` interface provides methods to add JSON Schemas and to construct __validator__ and __dicriminator__ RxJS operators for a set of Schema ids. To start processing data is RxJS stream one can take the following steps:
1. Instantiate an implementations of `DataValidator` interface;
2. Add required JSON Schema using `addSchemas()` method or other means provided by the implementation.
3. Get required RxJS operator for a set of JSON Schema ids using `validator()` or `discriminator()` methods.
4. Use the operator in RxJS data processing `pipe()`.

### Validator

A __validator__ operator uses single JSON Schema to validate data objects and throw an error if failed. Consider __discriminator__ operator if multiple JSON Schemas validation or custom error handling required.

`validator(id: JSONSchemaID)` constructs RxJS operator to validate data objects using JSON Schema selected by `id`. If validation fails a `ValidationError()` error is thrown.

The operator returns [Observable](https://rxjs.dev/api/index/class/Observable). 

### Discriminator

A __discriminator__ operator uses set of JSON Schemas to validate data objects and report invalid objects using supplied key.

`discriminator(ids: JSONSchemaID[], unk?: JSONSchemaID)` constructs RxJS operator to discriminate data objects using a set of JSON Schemas defined by `ids` array. Validated objects grouped by JSON Schema and marked with the schema's id, invalid objects reported in group marked with `unk` value. If validation fails and `unk` is not set a `ValidationError()` error is thrown.

If an interface implementation doesn't provide optimized validation for several JSON Schemas it executes signle JSON Schema validation attempts in `ids` array order.

The operator returns [GroupedObservable](https://rxjs.dev/api/index/class/GroupedObservable). For a returned _GroupedObservable_ `key` value is schema `$id`/`id` value for validated data objects and `unk` value for invalid data objects.

### Typing

`DataValidator` interface provides typing information for `validator` and `discriminator` methods using [generics](https://www.typescriptlang.org/docs/handbook/generics.html).

```typescript
validator<T>(...): OperatorFunction<unknown, T>

T is unknown by default.
```

One can create _JSON Schema -> Type_ mapping type to control __discriminator__ operator typing.

```typescript
// IDx - JSON schema ids, Tx - corresponding typescript types
type M = { ID1: T1, ID2: T2 }; 

discriminator<M>(...): OperatorFunction<
  unknown, 
  GroupedObservable<ID1 | ID2, T1 | T2>
>

<discriminator<M, true>(...): OperatorFunction<
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

ajv 
djv 
Hyperjump JSV
vue-vuelidate-jsonschema 
@cfworker/json-schema 

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
