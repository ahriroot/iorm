class BaseModel {
    constructor() {
    }

    save() {
        let data = {}
        Object.getOwnPropertyNames(this).forEach(key => {
            if (this[key].hasOwnProperty('iorm_type') && this[key].iorm_type === 'field') {
                data[key] = this[key].value
            }
        })
        return data
    }

    static new() {
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
