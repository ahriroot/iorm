import Field from "../base/field.js"
import { FieldProperty, FieldGenerate } from "src/types/func"

class Inteager extends Field {
    private readonly js_type: string = 'number'
    private readonly type: string = 'inteager'
    constructor(property: FieldProperty) {
        super(property)
    }
}

const InteagerField: FieldGenerate = (property: FieldProperty) => {
    let value = new Inteager(property)
    return new Proxy(value, {
        get: function (target, prop) {
            return target[prop]
        },
        set: function (target, prop, value) {
            target[prop] = value;
            return true
        }
    })
}

export default InteagerField