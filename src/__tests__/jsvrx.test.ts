/* no tsconfig.json at design time available (default is used?), eslint is ok */
import { from, concat, EMPTY } from 'rxjs';
import { reduce, toArray, tap, map, catchError, mergeMap } from 'rxjs/operators';

import { JSONSchema7 } from 'json-schema';

import { getSchemaID, ValidationError, DataValidator } from '../jsvrx';

const js1: JSONSchema7 = {
  $id: 'SCHEMA1',
  type: 'object',
  properties: {
    value: { type: 'integer' },
  },
  additionalProperties: false,
};
type T1 = {
  value: number;
};
type Mapping1 = { SCHEMA1: T1 };

const js2: JSONSchema7 = {
  $id: 'SCHEMA2',
  type: 'object',
  properties: {
    data: { type: 'string' },
  },
  additionalProperties: false,
};
type T2 = {
  data: string;
};
type Mapping2 = { SCHEMA2: T2 };

const sample1: T1[] = [{ value: 0 }, { value: 1 }, { value: 2 }];
const sample2: T2[] = [{ data: 'H' }, { data: 'R' }];
const sample = [sample1[0], sample2[0], sample1[1], sample1[2], sample2[1]];
type JSMap = Mapping1 & Mapping2;

function testProvider(name: string, provider: DataValidator, opt: { schemaIdReqired?: true }): void {
  test(`[${name}] schemas test`, () => {
    const noID = () => provider.addSchemas([{}]);
    if (opt.schemaIdReqired) expect(noID).toThrowError();
    else expect(noID).not.toThrowError();
  });
  test(`[${name}] validator test`, (done) => {
    expect.assertions(3);
    provider.addSchemas([js1]);
    expect(() => provider.validator('SCHEMA2')).toThrowError(); //new RangeError('Unknown schema: SCHEMA2.'));
    from(sample1)
      .pipe(
        provider.validator('SCHEMA1'),
        toArray(),
        tap((result) => expect(result).toStrictEqual(sample1)),
        provider.validator('SCHEMA1'),
        catchError((e) => {
          expect(e).toBeInstanceOf(ValidationError);
          return EMPTY;
        })
      )
      .subscribe({ complete: () => void done() });
  });

  test(`[${name}] discriminator test`, (done) => {
    expect.assertions(6);
    provider.addSchemas([js2]);
    expect(() => provider.discriminator(['SCHEMA2', 'SCHEMA3'])).toThrowError(); //new RangeError('Unknown schemas: SCHEMA3.')
    concat(
      from(sample).pipe(
        provider.discriminator<JSMap, false>(['SCHEMA1', 'SCHEMA2']),
        mergeMap((gobs) =>
          gobs.pipe(
            toArray(),
            map((v) => ({ [gobs.key]: v }))
          )
        ),
        reduce((acc, v) => ({ ...acc, ...v }), {} as Record<string, unknown>),
        tap((result) => {
          expect(result['SCHEMA1']).toStrictEqual(sample1);
          expect(result['SCHEMA2']).toStrictEqual(sample2);
        })
      ),
      from(sample).pipe(
        provider.discriminator(['SCHEMA1'], 'UNK'),
        mergeMap((gobs) =>
          gobs.pipe(
            toArray(),
            map((v) => ({ [gobs.key]: v }))
          )
        ),
        reduce((acc, v) => ({ ...acc, ...v }), {} as Record<string, unknown>),
        tap((result) => {
          expect(result['SCHEMA1']).toStrictEqual(sample1);
          expect(result['UNK']).toStrictEqual(sample2);
        })
      ),
      from(sample).pipe(
        provider.discriminator(['SCHEMA1']),
        catchError((e) => {
          expect(e).toBeInstanceOf(ValidationError);
          return EMPTY;
        })
      )
    ).subscribe({ complete: () => void done() });
  });
}

import ajv from 'ajv';
import { AjvDataValidator } from '../jsvrx-ajv';
testProvider('Ajv', new AjvDataValidator(new ajv()) && new AjvDataValidator(), {});

import djv from 'djv';
import { DjvDataValidator } from '../jsvrx-djv';
const djvVD = new djv();
djvVD.useVersion('draft-06');
testProvider('Djv', new DjvDataValidator(djvVD), {});

test('Helpers test', (done) => {
  expect(getSchemaID({ $id: 'id' })).toEqual('id');
  expect(getSchemaID({ id: 'id' })).toEqual('id');
  expect(getSchemaID({ $id: 'id', id: 'id4' })).toEqual('id');
  expect(getSchemaID({})).toBeUndefined();
  expect(getSchemaID({ $id: 'id' }, '$id')).toEqual('id');
  expect(getSchemaID({ $id: 'id' }, 'id')).toBeUndefined();
  expect(getSchemaID({ id: 'id' }, '$id')).toBeUndefined();
  expect(getSchemaID({ id: 'id' }, 'id')).toEqual('id');
  done();
});
