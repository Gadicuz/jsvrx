import { OperatorFunction, GroupedObservable } from 'rxjs';
import { groupBy, map } from 'rxjs/operators';

import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

export type JSONSchemaID = NonNullable<JSONSchema7['$id'] | JSONSchema6['$id'] | JSONSchema4['id']>;
export function getSchemaID(s: JSONSchema, id?: '$id' | 'id'): JSONSchemaID | undefined {
  switch (id) {
    case '$id':
      return '$id' in s ? (s.$id as JSONSchemaID) : undefined;
    case 'id':
      return 'id' in s ? s.id : undefined;
    default:
      return '$id' in s ? (s.$id as JSONSchemaID) : 'id' in s ? s.id : undefined;
  }
}

export class ValidationError<T> extends Error {
  public readonly name = 'ValidationError';
  constructor(public readonly item: T, message: string, public readonly e: unknown) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export type ValidatorOperator<T> = OperatorFunction<unknown, T>;
export type DefaultMapping<T = unknown> = { [k in JSONSchemaID]: T };
type SeparateGroups<K, M> = K extends keyof M ? GroupedObservable<K, M[K]> : never;
export type DiscriminatorOperator<M, S extends boolean = false> = OperatorFunction<
  unknown,
  S extends true ? SeparateGroups<keyof M, M> : GroupedObservable<keyof M, M[keyof M]>
>;

export function validator<T>(validate: (obj: unknown) => T): ValidatorOperator<T> {
  return map((obj) => validate(obj));
}
export function discriminator<M extends DefaultMapping = DefaultMapping, S extends boolean = false>(
  discriminate: (obj: unknown) => keyof M
): DiscriminatorOperator<M, S> {
  return groupBy((obj) => discriminate(obj)) as DiscriminatorOperator<M, S>;
}

export interface DataValidator {
  addSchemas(schemas: JSONSchema[]): void;
  validator<T = unknown>(id: JSONSchemaID): ValidatorOperator<T>;
  discriminator<M extends DefaultMapping = DefaultMapping, S extends boolean = false>(
    ids: (keyof M)[],
    unk?: JSONSchemaID
  ): DiscriminatorOperator<M, S>;
}
