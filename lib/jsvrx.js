import { groupBy, map } from 'rxjs/operators';
export function getSchemaID(s, id) {
    switch (id) {
        case '$id':
            return '$id' in s ? s.$id : undefined;
        case 'id':
            return 'id' in s ? s.id : undefined;
        default:
            return '$id' in s ? s.$id : 'id' in s ? s.id : undefined;
    }
}
export class ValidationError extends Error {
    constructor(item, message, e) {
        super(message);
        this.item = item;
        this.e = e;
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
export function validator(validate) {
    return map((obj) => validate(obj));
}
export function discriminator(discriminate) {
    return groupBy((obj) => discriminate(obj));
}
//# sourceMappingURL=jsvrx.js.map