
export class QuerySet {
    private readonly object: any
    private filterOptions: any = {}
    private excludeOptions: any = {}
    private skip_count: number = -1
    private limit_count: number = -1
    constructor(object: any) {
        this.object = object
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

    filter(filter: object) {
        this.filterOptions = filter
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

    async all() {
        return new Promise(async (resolve, reject) => {
            if (this.object.db === null || this.object.db === undefined) {
                this.object.db = await this.object.__open() as IDBDatabase
            }
            let objectStore = this.object.db.transaction([this.object.store_name], 'readonly').objectStore(this.object.store_name)
            let request = objectStore.openCursor()
            let data: any = []
            request.onsuccess = (event) => {
                let t = event.target as IDBRequest
                let cursor = t.result
                if (cursor) {
                    let push_flag = true
                    for (let k in this.filterOptions) {
                        if (cursor.value[k] != this.filterOptions[k]) {
                            push_flag = false
                        }
                    }
                    for (let k in this.excludeOptions) {
                        if (cursor.value[k] == this.excludeOptions[k]) {
                            push_flag = false
                        }
                    }
                    if (push_flag) {
                        if (this.skip_count > 0) {
                            this.skip_count--
                        } else {
                            data.push(cursor.value)
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
