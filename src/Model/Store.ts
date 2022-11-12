export class Store {
    prifix: string
    constructor(options: any) {
        this.prifix = options.prifix + ":" || "iorm:"
    }

    static init(options: any) {
        return new Store(options)
    }

    async get(key: string) {
        let count_key = localStorage.length
        let keys = []
        for (let i = 0; i < count_key; i++) {
            let key = localStorage.key(i)
            if (key.startsWith(this.prifix)) {
                keys.push(key)
            }
        }
        let k = keys.find(k => {
            let reg = new RegExp(this.prifix + ".*:" + key)
            return reg.test(k)
        })
        if (k) {
            let typ = k.split(":")[1]
            let data = localStorage.getItem(k)
            switch (typ) {
                case "string":
                    return data
                case "number":
                    return Number(data)
                case "boolean":
                    return data === "true"
                case "object":
                    return JSON.parse(data)
                default:
                    return data
            }
        }
        return null
    }

    async set(key: string, data: any) {
        let typ = typeof data
        let k = this.prifix + typ + ":" + key
        switch (typ) {
            case "string":
                localStorage.setItem(k, data)
                break
            case "number":
                localStorage.setItem(k, data.toString())
                break
            case "boolean":
                localStorage.setItem(k, data.toString())
                break
            case "object":
                localStorage.setItem(k, JSON.stringify(data))
                break
            default:
                localStorage.setItem(k, data)
                break
        }
        return true
    }

    async remove(key: string) {
        let count_key = localStorage.length
        let keys = []
        for (let i = 0; i < count_key; i++) {
            let key = localStorage.key(i)
            if (key.startsWith(this.prifix)) {
                keys.push(key)
            }
        }
        let k = keys.find(k => {
            let reg = new RegExp(this.prifix + ".*:" + key)
            return reg.test(k)
        })
        if (k) {
            localStorage.removeItem(k)
            return true
        }
        return false
    }
}

export default Store
