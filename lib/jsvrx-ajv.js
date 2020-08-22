import { ValidationError, validator, discriminator, } from './jsvrx';
import ajv from 'ajv';
function isAjv(opt) {
    if (!opt)
        return false;
    return ('compile' in opt && typeof opt.compile === 'function' && 'errorsText' in opt && typeof opt.errorsText === 'function');
}
export class AjvDataValidator {
    constructor(opt) {
        this.ajv = isAjv(opt) ? opt : new ajv(opt);
    }
    addSchemas(schemas) {
        this.ajv.addSchema(schemas);
    }
    validator(id) {
        const v = this.ajv.getSchema(id);
        if (!v)
            throw new RangeError(`Unknown schema: ${id}.`);
        return validator((obj) => {
            if (v(obj))
                return obj;
            throw new ValidationError(obj, this.ajv.errorsText(v.errors), v.errors);
        });
    }
    discriminator(ids, unk) {
        const funcs = ids.map((id) => this.ajv.getSchema(id));
        const missed = funcs.map((f, i) => (!f ? ids[i] : undefined)).filter((id) => id);
        if (missed.length != 0)
            throw new RangeError(`Unknown schemas: ${missed.join(',')}.`);
        const validators = funcs.filter((v) => !!v);
        return discriminator((obj) => {
            const k = validators.findIndex((v) => v(obj));
            if (k >= 0)
                return ids[k];
            if (unk != undefined)
                return unk;
            const e = validators.map((v) => v.errors);
            throw new ValidationError(obj, e.map((e) => this.ajv.errorsText(e)).join(';'), e);
        });
    }
}
//# sourceMappingURL=jsvrx-ajv.js.map