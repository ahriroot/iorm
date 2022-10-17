// types/func.d.ts

import { FieldProperty, KeyPathProperty } from "./field"

export interface IKeyPathFieldGenerate {
    (property: KeyPathProperty): any
}

export interface IFieldGenerate {
    (property: FieldProperty): any
}
