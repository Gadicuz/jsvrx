import {
  JSONSchema,
  JSONSchemaID,
  getSchemaID,
  DefaultMapping,
  ValidationError,
  DataValidator,
  ValidatorOperator,
  DiscriminatorOperator,
  validator,
  discriminator,
} from '../../jsvrx/src/jsvrx';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import djv from 'djv';

/** DataValidator interface implementation using Djv */
export class DjvDataValidator implements DataValidator {
  constructor(public djv: djv.djv) {}

  addSchemas(schemas: JSONSchema[]): void {
    schemas.forEach((s) => this.djv.addSchema(getSchemaID(s) || '', s));
  }

  validator<T>(id: JSONSchemaID): ValidatorOperator<T> {
    const r = this.djv.resolve(id);
    return validator((obj) => {
      const e = r.fn(obj) as string | undefined;
      if (e === undefined) return obj as T;
      throw new ValidationError(obj, e);
    });
  }

  discriminator<M extends DefaultMapping = DefaultMapping, S extends boolean = false>(
    ids: (keyof M)[],
    inv?: JSONSchemaID
  ): DiscriminatorOperator<M, S> {
    const validators = ids.map((id) => this.djv.resolve(id as JSONSchemaID)).map((r) => r.fn);
    return discriminator((obj) => {
      const e: string[] = [];
      const k = validators.findIndex((v) => {
        const r = v(obj) as string | undefined;
        if (r === undefined) return true;
        e.push(r);
        return false;
      });
      if (k >= 0) return ids[k];
      if (inv != undefined) return inv;
      throw new ValidationError(obj, e.join(';'), e);
    });
  }
}
