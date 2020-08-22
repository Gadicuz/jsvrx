/* no tsconfig.json at design time available (default is used?), eslint is ok */
import { of, from, concat } from 'rxjs';
import { reduce, toArray, tap, map, catchError, mergeMap } from 'rxjs/operators';

//import {} from '../../lib/jsvrx';
import { AjvDataValidator } from '../../lib/jsvrx-ajv';

import { JSONSchema7 } from 'json-schema';
import { getSchemaID } from '../../lib/jsvrx';

type JSONSchema7$id = JSONSchema7 & { $id: string };

const js1: JSONSchema7$id = {
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

const js2: JSONSchema7$id = {
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
type JSMap = Mapping1 & Mapping2;

test('Validator test (Ajv)', (done) => {
  const dv = new AjvDataValidator();
  dv.addSchemas([js1]);
  from(sample1)
    .pipe(
      dv.validator('SCHEMA1'),
      toArray(),
      tap((result) => expect(result).toStrictEqual(sample1))
    )
    .subscribe({ complete: () => void done() });
});

test('Discriminator test (Ajv)', (done) => {
  const dv = new AjvDataValidator();
  dv.addSchemas([js1, js2]);
  from([sample1[0], sample2[0], sample1[1], sample1[2], sample2[1]])
    .pipe(
      dv.discriminator(['SCHEMA1', 'SCHEMA2']),
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
    )
    .subscribe({ complete: () => void done() });
});
