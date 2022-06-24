// types/config.d.ts

export interface IORMConfig {
    db: {
        db_name: string
        db_version: number | null
    }
    store: {
        store_name: string | null
    }
}

export interface IORMMetadata {
    store_name: string
}
