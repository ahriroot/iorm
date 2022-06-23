import { FieldGenerate, FieldProperty } from "../../types/index"
import Field from "../base/field.js"


class Inteager extends Field {
    private readonly js_type: string = 'number'
    private readonly type: string = 'inteager'
    value: string
    constructor(property: FieldProperty) {
        super(property)
        this.value = property?.default || 0
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
