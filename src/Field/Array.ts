import { IFieldGenerate, FieldProperty } from "../../types/index"
import Field from "../base/field"


class Array extends Field {
    private readonly js_type: string = 'object'
    private readonly type: string = 'array'
    value: any[] = []
    constructor(property: FieldProperty) {
        super(property)
        if (typeof property?.default != 'object') {
            throw new Error('ArrayField default value must be array')
        }
        this.value = property.default
    }
}

const ArrayField: IFieldGenerate = (property: FieldProperty) => {
    let value = new Array(property)
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
