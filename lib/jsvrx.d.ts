import { OperatorFunction, GroupedObservable } from 'rxjs';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
export declare type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;
export declare type JSONSchemaID = NonNullable<JSONSchema7['$id'] | JSONSchema6['$id'] | JSONSchema4['id']>;
export declare function getSchemaID(s: JSONSchema, id?: '$id' | 'id'): JSONSchemaID | undefined;
export declare class ValidationError<T> extends Error {
    readonly item: T;
    readonly e: unknown;
    readonly name = "ValidationError";
    constructor(item: T, message: string, e: unknown);
}
export declare type ValidatorOperator<T> = OperatorFunction<unknown, T>;
export declare type DefaultMapping = {
    [k in JSONSchemaID]: unknown;
};
export declare type GroupedMapping<K, M> = K extends keyof M ? GroupedObservable<K, M[K]> : never;
export declare type DiscriminatorOperator<M> = OperatorFunction<unknown, GroupedMapping<keyof M, M>>;
export declare function validator<T>(validate: (obj: unknown) => T): ValidatorOperator<T>;
export declare function discriminator<M extends DefaultMapping = DefaultMapping>(discriminate: (obj: unknown) => keyof M): DiscriminatorOperator<M>;
export interface DataValidator {
    addSchemas(schemas: JSONSchema[]): void;
    validator<T = unknown>(id: JSONSchemaID): ValidatorOperator<T>;
    discriminator<M extends DefaultMapping = DefaultMapping>(ids: (keyof M)[], unk?: JSONSchemaID): DiscriminatorOperator<M>;
}
