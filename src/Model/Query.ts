
export class QuerySet {
    private readonly object_model: any
    private whereOptions: any = {}
    private excludeOptions: any = {}
    private skip_count: number = -1
    private limit_count: number = -1
    constructor(object: any) {
        this.object_model = object
        return new Proxy(this, {
            get: (target, prop) => {
                return target[prop]
            },
            set: (target, prop, value) => {
                if (prop == 'object') {
                    throw new Error('Cannot set readonly property object')
                }
                target[prop] = value
                return true
            }
        })
    }

    where(where: object) {
        this.whereOptions = where
        return this
    }

    exclude(exclude: object) {
        this.excludeOptions = exclude
        return this
    }

    skip(skip: number) {
        if (typeof skip != 'number') {
            throw new Error('skip must be a number')
        }
        this.skip_count = skip
        return this
    }

    limit(limit: number) {
        if (typeof limit != 'number') {
            throw new Error('limit must be a number')
        }
        this.limit_count = limit
        return this
    }

    async __all(ret_type: string = 'data') {
        return new Promise(async (resolve, reject) => {
            if (this.object_model.db === null || this.object_model.db === undefined) {
                this.object_model.db = await this.object_model.__open() as IDBDatabase
            }
            let key_path_field = this.object_model.get_key_path_field()
            let key_path_name = this.object_model.key_path_name()
            let objectStore = this.object_model.db.transaction([this.object_model.store_name], 'readonly').objectStore(this.object_model.store_name)
            let request = objectStore.openCursor()
            let data: any = []
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    let push_flag = true
                    for (let k in this.whereOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        } else {
                            if (cursor.value[k] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    for (let k in this.excludeOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        } else {
                            if (cursor.value[k] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    if (push_flag) {
                        if (this.skip_count > 0) {
                            this.skip_count--
                        } else {
                            switch (ret_type) {
                                case 'data':
                                    data.push(cursor.value)
                                    break
                                case 'object':
                                    let obj = new this.object_model.constructor()
                                    for (let data_key in cursor.value) {
                                        obj[data_key] = cursor.value[data_key]
                                    }
                                    data.push(obj)
                                    break
                                case 'key':
                                    data.push(cursor.value[key_path_field])
                                    break
                                default:
                                    data.push(cursor.value)
                                    break
                            }
                        }
                    }
                    if (this.limit_count >= 0 && data.length >= this.limit_count) {
                        resolve(data)
                        return
                    } else {
                        cursor.continue()
                    }
                } else {
                    resolve(data)
                    return
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }

    async all() {
        return this.__all('data')
    }

    async objs() {
        return new Promise(async (resolve, reject) => {
            if (this.object_model.db === null || this.object_model.db === undefined) {
                this.object_model.db = await this.object_model.__open() as IDBDatabase
            }
            let key_path_field = this.object_model.get_key_path_field()
            let key_path_name = this.object_model.key_path_name()
            let objectStore = this.object_model.db.transaction([this.object_model.store_name], 'readonly').objectStore(this.object_model.store_name)
            let request = objectStore.openCursor()
            let data: any = []
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    let push_flag = true
                    for (let k in this.whereOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        } else {
                            if (cursor.value[k] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    for (let k in this.excludeOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        } else {

                            if (cursor.value[k] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    if (push_flag) {
                        if (this.skip_count > 0) {
                            this.skip_count--
                        } else {
                            let obj = new this.object_model.constructor()
                            for (let data_key in cursor.value) {
                                obj[data_key] = cursor.value[data_key]
                            }
                            data.push(obj)
                        }
                    }
                    if (this.limit_count >= 0 && data.length >= this.limit_count) {
                        resolve(data)
                        return
                    } else {
                        cursor.continue()
                    }
                } else {
                    resolve(data)
                    return
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }

    objects = this.objs

    async obj() {
        return new Promise(async (resolve, reject) => {
            if (this.object_model.db === null || this.object_model.db === undefined) {
                this.object_model.db = await this.object_model.__open() as IDBDatabase
            }
            let key_path_field = this.object_model.get_key_path_field()
            let key_path_name = this.object_model.key_path_name()
            let objectStore = this.object_model.db.transaction([this.object_model.store_name], 'readonly').objectStore(this.object_model.store_name)
            let request = objectStore.openCursor()
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    let push_flag = true
                    for (let k in this.whereOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        } else {
                            if (cursor.value[k] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    for (let k in this.excludeOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        } else {

                            if (cursor.value[k] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    if (push_flag) {
                        if (this.skip_count > 0) {
                            this.skip_count--
                        } else {
                            let obj = new this.object_model.constructor()
                            for (let data_key in cursor.value) {
                                obj[data_key] = cursor.value[data_key]
                            }
                            resolve(obj)
                            return
                        }
                    }
                    cursor.continue()
                } else {
                    resolve(null)
                    return
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }

    object = this.obj

    async delete() {
        return new Promise(async (resolve, reject) => {
            if (this.object_model.db === null || this.object_model.db === undefined) {
                this.object_model.db = await this.object_model.__open() as IDBDatabase
            }
            let key_path_field = this.object_model.get_key_path_field()
            let key_path_name = this.object_model.key_path_name()
            let objectStore = this.object_model.db.transaction([this.object_model.store_name], 'readwrite').objectStore(this.object_model.store_name)
            let request = objectStore.openCursor()
            let data: any = []
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    let push_flag = true
                    for (let k in this.whereOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        } else {
                            if (cursor.value[k] != this.whereOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    for (let k in this.excludeOptions) {
                        if (k == key_path_field) {
                            if (cursor.value[key_path_name] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        } else {

                            if (cursor.value[k] == this.excludeOptions[k]) {
                                push_flag = false
                            }
                        }
                    }
                    if (push_flag) {
                        if (this.skip_count > 0) {
                            this.skip_count--
                        } else {
                            data.push(cursor.value)
                            cursor.delete()
                        }
                    }
                    if (this.limit_count >= 0 && data.length >= this.limit_count) {
                        resolve(data)
                        return
                    } else {
                        cursor.continue()
                    }
                } else {
                    resolve(data)
                    return
                }
            }

            request.onerror = (event) => {
                reject(event)
            }
        })
    }
}
