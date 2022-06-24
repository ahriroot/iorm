import { FieldProperty, IField } from "../../types/index"


/**
 * Field class
 */
class Field implements IField {
    private readonly iorm_type: string = 'field'
    verbose_name: string = ''
    nullable: boolean = false
    unique: boolean = false
    index: string | boolean = false
    constructor(property: FieldProperty) {
        property.hasOwnProperty('verbose_name') && (this.verbose_name = property.verbose_name)
        if (property.hasOwnProperty('verbose_name') && typeof property.verbose_name == 'string') {
            this.verbose_name = property.verbose_name
        }
        if (property.hasOwnProperty('nullable') && typeof property.nullable == 'boolean') {
            this.nullable = property.nullable
        }
        if (property.hasOwnProperty('unique') && typeof property.unique == 'boolean') {
            this.unique = property.unique
        }
        if (property.hasOwnProperty('index') && (typeof property.unique == 'string' || typeof property.unique == 'boolean')) {
            this.index = property.index
        }
    }
}

export default Field
