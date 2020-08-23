import {
  JSONSchema,
  JSONSchemaID,
  DefaultMapping,
  ValidationError,
  DataValidator,
  ValidatorOperator,
  DiscriminatorOperator,
  validator,
  discriminator,
} from '../../jsvrx/src/jsvrx';

import ajv from 'ajv';

function isAjv(opt?: ajv.Ajv | ajv.Options): opt is ajv.Ajv {
  if (!opt) return false;
  return (
    'compile' in opt && typeof opt.compile === 'function' && 'errorsText' in opt && typeof opt.errorsText === 'function'
  );
}

/** DataValidator interface implementation using Ajv */
export class AjvDataValidator implements DataValidator {
  readonly ajv: ajv.Ajv;
  constructor(opt?: ajv.Ajv | ajv.Options) {
    this.ajv = isAjv(opt) ? opt : new ajv(opt);
  }

  addSchemas(schemas: JSONSchema[]): void {
    this.ajv.addSchema(schemas);
  }

  validator<T>(id: JSONSchemaID): ValidatorOperator<T> {
    const v = this.ajv.getSchema(id);
    if (!v) throw new RangeError(`Unknown schema: ${id}.`);
    return validator((obj) => {
      if ((v as (obj: unknown) => obj is T)(obj)) return obj;
      throw new ValidationError(obj, this.ajv.errorsText(v.errors), v.errors);
    });
  }

  discriminator<M extends DefaultMapping = DefaultMapping, S extends boolean = false>(
    ids: (keyof M)[],
    inv?: JSONSchemaID
  ): DiscriminatorOperator<M, S> {
    const funcs = ids.map((id) => this.ajv.getSchema(id as JSONSchemaID));
    const missed = funcs.map((f, i) => (!f ? ids[i] : undefined)).filter((id) => id);
    if (missed.length != 0) throw new RangeError(`Unknown schemas: ${missed.join(',')}.`);
    const validators = funcs.filter((v): v is ajv.ValidateFunction => !!v);
    return discriminator((obj) => {
      const k = validators.findIndex((v) => v(obj));
      if (k >= 0) return ids[k];
      if (inv != undefined) return inv;
      const e = validators.map((v) => v.errors);
      throw new ValidationError(obj, e.map((e) => this.ajv.errorsText(e)).join(';'), e);
    });
  }
}
