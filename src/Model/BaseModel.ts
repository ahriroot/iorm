class BaseModel {
    db: string = ''
    constructor() {
    }

    save() {
        console.log(`iorm: ${this.db}`)
        let data = {}
        Object.getOwnPropertyNames(this).forEach(key => {
            if (this[key].hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                data[key] = this[key].value
            }
        })
        return data
    }

    /**
     * Get property value
     * @param name The name of the field
     * @returns value of the field
     */
    get(name: string) {
        let value = undefined;
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

    /**
     * Init model
     * @returns Object proxy of the model
     */
    static init() {
        return new Proxy(new this, {
            get: function (target, prop) {
                // if (target[prop].hasOwnProperty('iorm_type') && target[prop].iorm_type === 'field') {
                //     return target[prop].value
                // }
                return target[prop]
            },
            set: function (target, prop, value) {
                target[prop].value = value;
                return true
            }
        })
    }

    static generate(obj) {
        return new Proxy(obj, {
            get: function (target, prop) {
                // if (target[prop].hasOwnProperty('iorm_type') && target[prop].iorm_type === 'field') {
                //     return target[prop].value
                // }
                return target[prop]
            },
            set: function (target, prop, value) {
                target[prop].value = value;
                return true
            }
        })
    }
}

export default BaseModel
