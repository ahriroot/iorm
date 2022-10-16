import { IFieldGenerate, FieldProperty } from "../types/index"
import Field from "../base/field.js"


class Inteager extends Field {
    private readonly js_type: string = 'number'
    private readonly type: string = 'inteager'
    value: number = 0
    constructor(property: FieldProperty) {
        super(property)
        if (typeof property?.default === 'number') {
            this.value = property.default
        } else if (property.default === undefined) {
            this.value = 0
        } else {
            throw new Error('InteagerField default value must be number')
        }
    }
}

const InteagerField: IFieldGenerate = (property: FieldProperty) => {
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
