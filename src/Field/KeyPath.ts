import { IKeyPathFieldGenerate, KeyPathProperty } from "../types/index"
import Field from "../base/field.js"


class KeyPath extends Field {
    private readonly js_type: string = 'number'
    private readonly type: string = 'key_path'
    key_path_name: string = 'id'
    auto_increment: boolean = true
    constructor(property: KeyPathProperty) {
        super(property)
        if (typeof property.key_path_name == 'string' && property.key_path_name.trim().length > 0) {
            // 暂时不支持设置 key_path_name
            throw new Error("Custom 'key_path_name' is not supported for the time being in 'KeyPathField'")
            this.key_path_name = property.key_path_name.trim()
        }
        if (typeof property.auto_increment == 'boolean') {
            this.auto_increment = property.auto_increment
        }
    }
}

const KeyPathField: IKeyPathFieldGenerate = (property: KeyPathProperty) => {
    let value = new KeyPath(property)
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

export default KeyPathField
