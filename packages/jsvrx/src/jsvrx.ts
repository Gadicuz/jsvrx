import { OperatorFunction, GroupedObservable } from 'rxjs';
import { groupBy, map } from 'rxjs/operators';

import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

export type JSONSchemaID = NonNullable<JSONSchema7['$id'] | JSONSchema6['$id'] | JSONSchema4['id']>;

/**
 * Get schema id for a JSONSchema.
 *
 * @param s - a JSONSchema to get id
 * @param id - required id property or any if undefined
 * @returns - schema id or undefined
 */
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

/**
 * Validation error object if validation fails or
 * discrimination fails and no id provided for invalid objects.
 */
export class ValidationError<T> extends Error {
  public readonly name = 'ValidationError';
  constructor(public readonly item: T, message: string, public readonly e?: unknown) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/** Validator operator RxJS type */
export type ValidatorOperator<T> = OperatorFunction<unknown, T>;
/** Default mapping for type T */
export type DefaultMapping<T = unknown> = { [k in JSONSchemaID]: T };
type SeparateGroups<K, M> = K extends keyof M ? GroupedObservable<K, M[K]> : never;
/** Discriminator operator RxJS type */
export type DiscriminatorOperator<M, S extends boolean = false> = OperatorFunction<
  unknown,
  S extends true ? SeparateGroups<keyof M, M> : GroupedObservable<keyof M, M[keyof M]>
>;

/** Helper function to implement `DataValidator.validator()` method.
 *  Requires object validator function.
 */
export function validator<T>(validate: (obj: unknown) => T): ValidatorOperator<T> {
  return map((obj) => validate(obj));
}

/**
 * Helper function to implement `DataValidator.discriminator()` method.
 * Requires object discriminator (multiple validator) function.
 */
export function discriminator<M extends DefaultMapping = DefaultMapping, S extends boolean = false>(
  discriminate: (obj: unknown) => keyof M
): DiscriminatorOperator<M, S> {
  return groupBy((obj) => discriminate(obj)) as DiscriminatorOperator<M, S>;
}

export interface DataValidator {
  /** Adds JSONSchemas to validator context. Added schemas are refernced by standard JSON schema `id`. */
  addSchemas(schemas: JSONSchema[]): void;

  /**
   * Creates RxJS operator to validate data objects using JSON schema `id`.
   * Throws `ValidationError` if validation fails.
   */
  validator<T = unknown>(id: JSONSchemaID): ValidatorOperator<T>;

  /** Creates RxJS operator to discriminate data objects using set of JSON schemas.
   * Operator returns `GroupedObservable` for every id from `ids` and
   * dedicated `GroupedObservable` for invalid objects if `ind` parameter is defined.
   *
   * @param ids - array of schema identifiers
   * @param inv - an identifier to assign to invalid object group
   */
  discriminator<M extends DefaultMapping = DefaultMapping, S extends boolean = false>(
    ids: (keyof M)[],
    inv?: JSONSchemaID
  ): DiscriminatorOperator<M, S>;
}
