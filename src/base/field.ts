import { FieldProperty } from "src/types/func"

/**
 * Field
 */
class Field {
    private readonly iorm_type: string = 'field'
    verbose_name: string
    nullable: boolean
    constructor(property: FieldProperty) {
        this.verbose_name = property?.verbose_name || ''
        this.nullable = property?.nullable || false
    }
}

export default Field
