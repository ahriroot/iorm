import { DefaultKeyPath } from "../base/const.js"
import { IBaseModel, IORMConfig } from "../../types/index"
import KeyPathField from "../Field/KeyPath.js"

/**
 * BaseModel
 */
class BaseModel implements IBaseModel {
    protected db_name: string = ''
    protected db_version: number = 0

    protected store_name: string
    protected db: IDBDatabase | null = null

    constructor(config: IORMConfig = { db: { db_name: '', db_version: 0 }, store: { store_name: null } }) {
        this.store_name = this.toLowerLine(this.constructor.name)  // store name, default class name lowercase underscore

        this.db_name = config.db.db_name  // database name
        this.db_version = config.db.db_version  // database version
        if (config.store.store_name !== null) {
            this.store_name = config.store.store_name  // custome store name
        }

        // this.__open().then((db: IDBDatabase) => {
        //     this.db = db
        // }).catch(err => {
        //     throw new Error(err)
        // })
        return new Proxy(this, {
            get: (target, prop) => {
                // if (target[prop].hasOwnProperty('iorm_type') && target[prop].iorm_type === 'field') {
                //     return target[prop].value
                // }
                return target[prop]
            },
            set: (target, prop, value) => {
                if (target[prop]?.hasOwnProperty('iorm_type') && target[prop]?.iorm_type === 'field') {
                    target[prop].value = value
                } else {
                    target[prop] = value
                }
                return true
            }
        })
    }

    /**
     * 
     * @param str The string to be converted to lower line
     * @returns lower line
     */
    toLowerLine = (str: string) => {
        let tmp = str.replace(/([A-Z])/g, "_$1").toLowerCase()
        if (tmp.slice(0, 1) === '_') {
            tmp = tmp.slice(1)
        }
        return tmp
    }

    __get_key_path() {
        let key_path: string = DefaultKeyPath
        Object.getOwnPropertyNames(this).forEach(key => {
            if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                if (this[key].type === 'key_path') {
                    key_path = key
                }
            }
        })
        return key_path
    }

    /**
     * Open database and create store
     * @returns Promise(db)
     */
    __open() {
        return new Promise((resolve, reject) => {
            let indexedDB = window.indexedDB
            let request = indexedDB.open(this.db_name, this.db_version)
            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                let t = event.target as IDBRequest
                let db = t.result
                let key_path = DefaultKeyPath  // default KeyPath
                let auto_increment = true  // default KeyPath auto_increment
                let index_dict = []  // index list

                Object.getOwnPropertyNames(this).forEach(key => {
                    // create KeyPath
                    if (
                        this[key]?.hasOwnProperty('iorm_type')
                        && this[key].iorm_type === 'field'
                        && this[key]?.hasOwnProperty('type')
                        && this[key].type === 'key_path'
                    ) {
                        key_path = this[key].key_path_name
                        auto_increment = this[key].auto_increment
                    } else {
                        this[key_path] = KeyPathField({ key_path_name: key_path, auto_increment: false })
                    }

                    // save index into index_dict
                    if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                        if (typeof this[key].index == 'string') {
                            index_dict.push({
                                field_name: key,
                                index_name: this[key].index,
                                options: { unique: this[key].unique }
                            })
                        }
                    }
                })

                // create store
                let objStore = db.createObjectStore(this.store_name, {
                    keyPath: key_path,
                    autoIncrement: auto_increment
                })

                // create index
                index_dict.forEach(index => {
                    objStore.createIndex(index.index_name, index.field_name, index.options)
                })
                objStore.transaction.oncomplete = (_: any) => {
                    resolve(db)
                }
            }
            request.onsuccess = (event: Event) => {
                let t = event.target as IDBRequest
                resolve(t.result)
            }
            request.onerror = (event: Event) => {
                let t = event.target as IDBRequest
                reject(t.error)
            }
        })
    }

    /**
     * Save data to database and return the primary id
     * @returns Record primary id
     */
    async save(ret: 'id' | 'data' | 'object' = 'id') {
        return new Promise(async (resolve, reject) => {
            if (this.db === null || this.db === undefined) {
                this.db = await this.__open() as IDBDatabase
            }
            let data = {}
            Object.getOwnPropertyNames(this).forEach(key => {
                if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                    data[key] = this[key].value
                }
            })
            let key_path = this.__get_key_path()
            console.log(key_path, this[key_path])
            if (data[key_path] === undefined || data[key_path] === null || data[key_path] === '') {
                delete data[key_path]
            }
            console.log(data)

            let request = this.db.transaction([this.store_name], 'readwrite')
                .objectStore(this.store_name)
                .add(data)

            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                this[this.__get_key_path()] = t.result
                switch (ret) {
                    case 'id':
                        resolve(t.result)
                        break
                    case 'data':
                        resolve(data)
                        break
                    case 'object':
                        resolve(this)
                        break
                    default:
                        resolve(t.result)
                        break
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }

    static async find(filter: any = {}, options: any = { ret: 'data' }) {
        let obj = new this()
        return new Promise(async (resolve, reject) => {
            if (obj.db === null || obj.db === undefined) {
                obj.db = await obj.__open() as IDBDatabase
            }
            let objectStore = obj.db.transaction([obj.store_name], 'readonly').objectStore(obj.store_name)
            let request = objectStore.openCursor()
            let data: any = []
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    switch (options.ret) {
                        case 'data':
                            data.push(cursor.value)
                            break
                        case 'object':
                            let obj_data = new this()
                            Object.getOwnPropertyNames(obj_data).forEach(key => {
                                if (obj_data[key]?.hasOwnProperty('iorm_type') && obj_data[key].iorm_type === 'field') {
                                    obj_data[key] = cursor.value[key]
                                }
                            })
                            data.push(obj_data)
                            break
                        default:
                            data.push(cursor.value)
                            break
                    }
                    cursor.continue()
                } else {
                    resolve(data)
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }

    /**
     * Get one data by primary id
     * @param id primary id
     */
    async find(filter: any = {}, options: any = { ret: 'data' }) {
        return new Promise(async (resolve, reject) => {
            if (this.db === null || this.db === undefined) {
                this.db = await this.__open() as IDBDatabase
            }
            let objectStore = this.db.transaction([this.store_name], 'readonly').objectStore(this.store_name)
            let request = objectStore.openCursor()
            let data: any = []
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    switch (options.ret) {
                        case 'data':
                            data.push(cursor.value)
                            break
                        case 'object':
                            data.push(new (this.constructor as any)(cursor.value))
                            break
                        default:
                            data.push(cursor.value)
                            break
                    }
                    cursor.continue()
                } else {
                    resolve(data)
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }

    find_many = this.find

    /**
     * Get property value
     * @param name The name of the field
     * @returns value of the field
     */
    get(name: string) {
        let value = undefined
        Object.getOwnPropertyNames(this).forEach(key => {
            console.log(key == name)
            if (key == name) {
                value = this[key].value
            }
        })
        // value 不允许为 undefined
        // if(value === undefined) {
        //     throw new Error(`IORM: ${name} is not defined`)
        // }
        return value
    }
}

export default BaseModel
