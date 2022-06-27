// types/config.d.ts

export interface IORMConfigDatabase {
    db_name: string
    db_version: number | null
}

export interface IORMConfigStore {
    store_name: string | null
}

export interface IORMConfigSetting {
    default_type: 'data' | 'object' | 'key'
}

export interface IORMConfig {
    db: IORMConfigDatabase
    store?: IORMConfigStore
    setting?: IORMConfigSetting
}
