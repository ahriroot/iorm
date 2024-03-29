import { IFieldGenerate, FieldProperty } from "../types/index"
import Field from "../base/field.js"


class ArrayF extends Field {
    private readonly js_type: string = 'object'
    private readonly type: string = 'array'
    value: any[] = []
    constructor(property: FieldProperty) {
        super(property)
        if (Array.isArray(property?.default) || typeof property?.default === 'function') {
            this.value = property.default
        } else if (property.default === undefined) {
            this.value = []
        } else {
            if (this.nullable === true && property.default === null) {
                this.value = null
            } else {
                throw new Error('ArrayField default value must be array')
            }
        }
    }
}

const ArrayField: IFieldGenerate = (property: FieldProperty) => {
    let value = new ArrayF(property)
    return new Proxy(value, {
        get: function (target, prop) {
            return target[prop]
        },
        set: function (target, prop, value) {
            target[prop] = value
            return true
        }
    })
}

export default ArrayField
