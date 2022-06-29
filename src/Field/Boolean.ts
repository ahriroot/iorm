import { IFieldGenerate, FieldProperty } from "../types/index"
import Field from "../base/field.js"


class Boolean extends Field {
    private readonly js_type: string = 'boolean'
    private readonly type: string = 'boolean'
    value: boolean
    constructor(property: FieldProperty) {
        super(property)
        if (typeof property?.default != 'boolean') {
            throw new Error('BooleanField default value must be boolean')
        }
        this.value = property.default
    }
}

const BooleanField: IFieldGenerate = (property: FieldProperty) => {
    let value = new Boolean(property)
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

export default BooleanField
