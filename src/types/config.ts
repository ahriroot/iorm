// types/config.d.ts

export interface IORMConfigDatabase {
    name: string
    version: number | undefined
}

export interface IORMConfigStore {
    name: string | undefined
}

export interface IORMConfigSetting {
    default_type: 'data' | 'object' | 'key'
}

export interface IORMConfig {
    db: IORMConfigDatabase
    store?: IORMConfigStore | undefined
    setting?: IORMConfigSetting | undefined
}

export interface IORMBaseModelProperty {
    db_name: string
    db_version: number

    store_name: string,
    db_object: IDBDatabase | null

    default_type: string

    key_path: string
    auto_increment: boolean
}

export interface IORM {
    models: any[]
}
