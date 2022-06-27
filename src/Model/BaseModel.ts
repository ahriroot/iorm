import { DefaultKeyPath } from "../base/const.js"
import { IBaseModel, IORMConfig, IORMConfigSetting } from "../../types/index"
import { QuerySet } from "./Query.js"

/**
 * BaseModel
 */
class BaseModel implements IBaseModel {
    protected db_name: string = ''
    protected db_version: number = 0

    protected store_name: string
    protected db: IDBDatabase | null = null

    protected setting: IORMConfigSetting = {
        default_type: 'data'
    }

    protected key_path: string = DefaultKeyPath  // default KeyPath
    protected auto_increment: boolean = true  // default KeyPath

    constructor(config: IORMConfig = { db: { db_name: '', db_version: 0 }, store: { store_name: null }, setting: { default_type: 'data' } }) {
        this.store_name = this.toLowerLine(this.constructor.name)  // store name, default class name lowercase underscore

        this.db_name = config.db.db_name  // database name
        this.db_version = config.db.db_version  // database version
        if (config.store.store_name !== null) {
            this.store_name = config.store.store_name  // custome store name
        }
        this.setting = config.setting  // setting
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

    key_path_name() {
        Object.getOwnPropertyNames(this).forEach(key => {
            if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                if (this[key].type === 'key_path') {
                    this.key_path = this[key].key_path_name
                }
            }
        })
        return this.key_path
    }

    get_key_path_field() {
        let key_path_field = null
        Object.getOwnPropertyNames(this).forEach(key => {
            if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                if (this[key].type === 'key_path') {
                    key_path_field = key
                }
            }
        })
        return key_path_field
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
                let auto_increment = true  // default KeyPath auto_increment
                let index_dict = []  // index list

                let key_path_has_defined: number = 0
                Object.getOwnPropertyNames(this).forEach(key => {
                    // create KeyPath
                    if (
                        this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field'
                        && this[key]?.hasOwnProperty('type') && this[key].type === 'key_path'
                    ) {
                        key_path_has_defined++
                        this.key_path = this[key].key_path_name
                        this.auto_increment = this[key].auto_increment
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
                if (key_path_has_defined == 0) {
                    reject(new Error('KeyPath is not defined'))
                } else if (key_path_has_defined > 1) {
                    reject(new Error('KeyPath is defined more than one'))
                }

                // create store
                let objStore = db.createObjectStore(this.store_name, {
                    keyPath: this.key_path,
                    autoIncrement: this.auto_increment
                })

                // create index
                index_dict.forEach(index => {
                    objStore.createIndex(index.field_name, index.index_name, index.options)
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
     * @param ret Return type
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
                    if (this[key].type === 'key_path') {
                        data[this[key].key_path_name] = this[key].value
                    } else {
                        data[key] = this[key].value
                    }
                }
            })
            let request
            if (data[this.key_path] === undefined || data[this.key_path] === null || data[this.key_path] === '') {
                delete data[this.key_path]
                request = this.db.transaction([this.store_name], 'readwrite')
                    .objectStore(this.store_name)
                    .add(data)
            } else {
                request = this.db.transaction([this.store_name], 'readwrite')
                    .objectStore(this.store_name)
                    .put(data)
            }

            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                this[this.key_path_name()] = t.result
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
            request.onerror = (event: Event) => {
                let t = event.target as IDBRequest
                reject(t.error)
            }
        })
    }

    /**
     * Save data to database and return the primary id
     * @param ret Return type
     * @returns Record primary id
     */
    async insert(ret: 'id' | 'data' | 'object' = 'id') {
        return new Promise(async (resolve, reject) => {
            if (this.db === null || this.db === undefined) {
                this.db = await this.__open() as IDBDatabase
            }
            let data = {}
            Object.getOwnPropertyNames(this).forEach(key => {
                if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                    if (this[key].type === 'key_path') {
                        this.key_path = this[key].key_path_name
                        data[this.key_path] = this[key].value
                    } else {
                        data[key] = this[key].value
                    }
                }
            })
            if (data[this.key_path] === undefined || data[this.key_path] === null || data[this.key_path] === '') {
                delete data[this.key_path]
            }

            let request = this.db.transaction([this.store_name], 'readwrite')
                .objectStore(this.store_name)
                .add(data)

            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                this[this.key_path] = t.result
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
            request.onerror = (event: Event) => {
                let t = event.target as IDBRequest
                reject(t.error)
            }
        })
    }

    static async insert(data: any, ret: 'id' | 'data' | 'object' = 'id') {
        let object = new this()
        Object.getOwnPropertyNames(object).forEach(key => {
            if (object[key]?.hasOwnProperty('iorm_type') && object[key].iorm_type === 'field') {
                object[key] = data[key]
            }
        })
        return object.insert(ret)
    }

    static find() {
        let query = new QuerySet(new this())
        return query
    }
    static find_many = BaseModel.find

    static where(filter: object = {}) {
        let query = new QuerySet(new this())
        return query.where(filter)
    }

    static all() {
        let query = new QuerySet(new this())
        return query.all()
    }

    /**
     * Get property value
     * @param name The name of the field
     * @returns value of the field
     */
    get(name: string) {
        let value = undefined
        Object.getOwnPropertyNames(this).forEach(key => {
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
