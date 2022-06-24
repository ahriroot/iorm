// types/class.d.ts

import { IORMConfig, IORMMetadata } from './config'

export interface IBaseModel {
    get(name: string): any
}
