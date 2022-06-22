import Field from "src/base/field"

interface FieldProperty {
    verbose_name?: string
    nullable?: boolean
    default?: any
}

export interface FieldGenerate {
    (property: FieldProperty): Field
}