import { IORMConfig } from "../types/config.js"
import BaseModel from "./BaseModel.js"
import DB from "./DB.js"


interface IORM {
    db: DB,
    models: BaseModel[]
}

const init = async (options: IORM) => {
    let dbs = {}
    options.models.forEach((model: any) => {
        let obj = new model()

        if (!dbs.hasOwnProperty(obj.__iorm_property.db_name)) {
            dbs[obj.__iorm_property.db_name] = []
        }

        let store = {
            db_version: obj.__iorm_property.db_version,
            store_name: obj.__iorm_property.store_name,
            key_path: undefined,
            auto_increment: undefined,
            index_dict: [],
        }

        Object.getOwnPropertyNames(obj).forEach(key => {
            if (obj[key]?.hasOwnProperty('iorm_type') && obj[key].iorm_type === 'field') {
                if (obj[key]?.hasOwnProperty('type') && obj[key].type === 'key_path') {
                    if (store.key_path) {
                        throw new Error('KeyPath is defined more than one')
                    }
                    store.key_path = obj[key].key_path_name
                    store.auto_increment = obj[key].auto_increment
                } else if (obj[key].index && typeof obj[key].index == 'string') {
                    store.index_dict.push({
                        field_name: key,
                        index_name: obj[key].index,
                        options: { unique: obj[key].unique }
                    })
                } else {
                    // throw new Error('Index is not defined')
                }
            }
        })
        if (store.key_path === undefined) {
            throw new Error('KeyPath is not defined')
        }
        dbs[obj.__iorm_property.db_name].push(store)
    })

    // 遍历所有的数据库
    let count_finished = 0
    for (let db_name in dbs) {
        let stores = dbs[db_name]
        stores.forEach(store => {
            let indexedDB = window.indexedDB
            let request = indexedDB.open(store.db_name, store.db_version || 1)
            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                let t = event.target as IDBRequest
                let db = t.result

                let objStore = db.createObjectStore(store.store_name, {
                    keyPath: store.key_path,
                    autoIncrement: store.auto_increment
                })
                store.index_dict.forEach(index => {
                    objStore.createIndex(index.field_name, index.index_name, index.options)
                })

                objStore.transaction.oncomplete = (_: any) => {
                    count_finished++
                }
            }
            request.onsuccess = (_: Event) => {
            }
            request.onerror = (event: Event) => {
                let t = event.target as IDBRequest
                // reject(t.error)
                throw new Error(t.error?.message)
            }
        })
    }
    return count_finished
}

export default init
