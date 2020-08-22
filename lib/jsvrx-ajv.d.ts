import { JSONSchema, JSONSchemaID, DefaultMapping, DataValidator, ValidatorOperator, DiscriminatorOperator } from './jsvrx';
import ajv from 'ajv';
export declare class AjvDataValidator implements DataValidator {
    readonly ajv: ajv.Ajv;
    constructor(opt?: ajv.Ajv | ajv.Options);
    addSchemas(schemas: JSONSchema[]): void;
    validator<T>(id: JSONSchemaID): ValidatorOperator<T>;
    discriminator<M extends DefaultMapping = DefaultMapping>(ids: (keyof M)[], unk?: JSONSchemaID): DiscriminatorOperator<M>;
}
