import { FieldProperty, IField } from "../../types/index"


/**
 * Field class
 */
class Field implements IField {
    private readonly iorm_type: string = 'field'
    verbose_name: string
    nullable: boolean
    constructor(property: FieldProperty) {
        this.verbose_name = property?.verbose_name || ''
        this.nullable = property?.nullable || false
    }
}

export default Field
