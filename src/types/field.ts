// types/field.d.ts

export interface KeyPathProperty {
    verbose_name?: string
    auto_increment?: boolean
    key_path_name?: string | null | undefined
}

export interface FieldProperty {
    verbose_name?: string
    nullable?: boolean
    default?: any
    unique?: boolean
    index?: string | boolean
}

export interface IField {

}
