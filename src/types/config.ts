// types/config.d.ts

export interface IORMConfigDatabase {
    db_name: string
    db_version: number | null | undefined
}

export interface IORMConfigStore {
    store_name: string | null | undefined
}

export interface IORMConfigSetting {
    default_type: 'data' | 'object' | 'key'
}

export interface IORMConfig {
    db: IORMConfigDatabase
    store?: IORMConfigStore | null | undefined
    setting?: IORMConfigSetting | null | undefined
}

export interface BaseModelProperty {
    db_name: string
    db_version: number

    store_name: string,
    db_object: IDBDatabase | null

    setting: IORMConfigSetting

    key_path: string
    auto_increment: boolean
}
