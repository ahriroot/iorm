import { FieldGenerate, FieldProperty } from "../../types/index"
import Field from "../base/field.js"


class Boolean extends Field {
    private readonly js_type: string = 'boolean'
    private readonly type: string = 'boolean'
    value: boolean
    constructor(property: FieldProperty) {
        super(property)
        this.value = typeof property?.default == 'boolean' ? property.default : false
    }
}

const BooleanField: FieldGenerate = (property: FieldProperty) => {
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
