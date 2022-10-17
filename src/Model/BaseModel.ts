import { DefaultKeyPath } from "../base/const.js"
import { IORMBaseModelProperty, IORMConfig, IORMConfigDatabase, IORMConfigStore } from "../types/index"
import { QuerySet } from "./Query.js"


/**
 * BaseModel
 */
class BaseModel {
    protected __iorm_property: IORMBaseModelProperty = {
        db_name: '',
        db_version: 0,

        store_name: '',
        db_object: null,

        setting: {
            default_type: 'data'
        },

        key_path: DefaultKeyPath,  // default KeyPath is 'id'
        auto_increment: true,  // default KeyPath
    }

    constructor(config: IORMConfig = { db: { db_name: '', db_version: 0 }, store: { store_name: '' }, setting: { default_type: 'data' } }) {
        this.__iorm_property.store_name = this.toLowerLine(this.constructor.name)  // store name, default class name lowercase underscore

        this.__iorm_property.db_name = config.db.db_name  // database name
        this.__iorm_property.db_version = config.db.db_version  // database version
        if (config.store && config.store.store_name !== '') {
            this.__iorm_property.store_name = config.store.store_name  // custome store name
        }
        if (config.setting) {
            this.__iorm_property.setting = config.setting  // setting
        }
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
                    this.__iorm_property.key_path = this[key].key_path_name
                }
            }
        })
        return this.__iorm_property.key_path
    }

    get_key_path_field() {
        let key_path_field: string | null = null
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
            let request = indexedDB.open(this.__iorm_property.db_name, this.__iorm_property.db_version)
            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                let t = event.target as IDBRequest
                let db = t.result
                let auto_increment = true  // default KeyPath auto_increment
                let index_dict: {
                    field_name: string,
                    index_name: string,
                    options: { unique: boolean }
                }[] = []  // index list

                let key_path_has_defined: number = 0
                Object.getOwnPropertyNames(this).forEach(key => {
                    // create KeyPath
                    if (
                        this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field'
                        && this[key]?.hasOwnProperty('type') && this[key].type === 'key_path'
                    ) {
                        key_path_has_defined++
                        this.__iorm_property.key_path = this[key].key_path_name
                        this.__iorm_property.auto_increment = this[key].auto_increment
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
                let objStore = db.createObjectStore(this.__iorm_property.store_name, {
                    keyPath: this.__iorm_property.key_path,
                    autoIncrement: this.__iorm_property.auto_increment
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
            if (this.__iorm_property.db_object === null || this.__iorm_property.db_object === undefined) {
                this.__iorm_property.db_object = await this.__open() as IDBDatabase
            }
            let data = {}
            Object.getOwnPropertyNames(this).forEach(key => {
                if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                    if (this[key].type === 'key_path') {
                        data[this[key].key_path_name] = this[key].value
                    } else {
                        let k = key
                        if (this[key].field_name) {
                            k = this[key].field_name
                        }
                        if (typeof this[key].value == "function") {
                            data[k] = this[key].value()
                        } else {
                            data[k] = this[key].value
                        }
                    }
                }
            })
            let request
            if (data[this.__iorm_property.key_path] === undefined || data[this.__iorm_property.key_path] === null || data[this.__iorm_property.key_path] === '') {
                delete data[this.__iorm_property.key_path]
                request = this.__iorm_property.db_object.transaction([this.__iorm_property.store_name], 'readwrite')
                    .objectStore(this.__iorm_property.store_name)
                    .add(data)
            } else {
                request = this.__iorm_property.db_object.transaction([this.__iorm_property.store_name], 'readwrite')
                    .objectStore(this.__iorm_property.store_name)
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
            if (this.__iorm_property.db_object === null || this.__iorm_property.db_object === undefined) {
                this.__iorm_property.db_object = await this.__open() as IDBDatabase
            }
            let data = {}
            console.log(this)
            Object.getOwnPropertyNames(this).forEach(key => {
                if (this[key]?.hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                    if (this[key].type === 'key_path') {
                        this.__iorm_property.key_path = this[key].key_path_name
                        data[this.__iorm_property.key_path] = this[key].value
                    } else {
                        let k = key
                        if (this[key].field_name) {
                            k = this[key].field_name
                        }
                        if (typeof this[key].value == "function") {
                            data[k] = this[key].value()
                        } else {
                            data[k] = this[key].value
                        }
                    }
                }
            })
            if (data[this.__iorm_property.key_path] === undefined || data[this.__iorm_property.key_path] === null || data[this.__iorm_property.key_path] === '') {
                delete data[this.__iorm_property.key_path]
            }

            let request = this.__iorm_property.db_object.transaction([this.__iorm_property.store_name], 'readwrite')
                .objectStore(this.__iorm_property.store_name)
                .add(data)

            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                this[this.__iorm_property.key_path] = t.result
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

    static find(): QuerySet {
        let query = new QuerySet(new this())
        return query
    }
    static find_many = BaseModel.find

    static where(filter: object = {}): QuerySet {
        let query = new QuerySet(new this())
        return query.where(filter)
    }

    static all(): Promise<any> {
        let query = new QuerySet(new this())
        return query.all()
    }

    static get(): Promise<any> {
        let query = new QuerySet(new this())
        return query.get()
    }

    static obj(): Promise<any> {
        let query = new QuerySet(new this())
        return query.obj()
    }

    static object(): Promise<any> {
        let query = new QuerySet(new this())
        return query.obj()
    }

    static objs(): Promise<any> {
        let query = new QuerySet(new this())
        return query.obj()
    }

    static objects(): Promise<any> {
        let query = new QuerySet(new this())
        return query.objs()
    }

    static delete(): Promise<any> {
        console.warn("There is no filter condition for deleting data")
        let query = new QuerySet(new this())
        return query.delete()
    }

    static order(order: object): QuerySet {
        let query = new QuerySet(new this())
        return query.order(order)
    }

    static filter(filter: object): QuerySet {
        let query = new QuerySet(new this())
        return query.filter(filter)
    }

    static db(val: string | IORMConfigDatabase | null | undefined = null) {
        let query = new QuerySet(new this())
        return query.db(val)
    }

    static store(val: string | IORMConfigStore | null | undefined = null) {
        let query = new QuerySet(new this())
        return query.store(val)
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
