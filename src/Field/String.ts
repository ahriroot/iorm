import Field from "../base/field.js"
import { FieldProperty, FieldGenerate } from "src/types/func"

class String extends Field {
    private readonly js_type: string = 'string'
    private readonly type: string = 'string'
    value: string
    constructor(property: FieldProperty) {
        super(property)
        this.value = property?.default || ''
    }
}

const StringField: FieldGenerate = (property: FieldProperty) => {
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