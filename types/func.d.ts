// types/func.d.ts

import { FieldProperty, IField } from "./field";


export interface FieldGenerate {
    (property: FieldProperty): IField
}
