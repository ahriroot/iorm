import { IFieldGenerate, FieldProperty } from "../types/index"
import Field from "../base/field.js"


class String extends Field {
    private readonly js_type: string = 'string'
    private readonly type: string = 'string'
    value: string = ''
    constructor(property: FieldProperty) {
        super(property)
        if (typeof property?.default === 'string') {
            this.value = property.default
        } else if (property.default === undefined) {
            this.value = ''
        } else {
            throw new Error('StringField default value must be string')
        }
    }
}

const StringField: IFieldGenerate = (property: FieldProperty) => {
    return new Proxy(new String(property), {
        get: function (target, prop) {
            return target[prop]
        },
        set: function (target, prop, value) {
            target[prop] = value;
            return true
        }
    })
}

export default StringField
