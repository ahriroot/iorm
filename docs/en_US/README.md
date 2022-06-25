[简体中文](./docs/zh_CN/README.md)|[English](./docs/en_US/README.md)

## 介绍

IORM 是 IndexedDB 工具包和对象关系映射器，它为应用程序开发人员提供了 IndexdbDB 的全部功能和灵活性。

## 安装

```shell
npm install iorm

# OR

yarn add iorm
```

## 快速开始

#### 创建数据库模型

```javascript
import {
    BaseModel,
    ArrayField,
    KeyPathField,
    InteagerField,
    StringField,
    BooleanField
} from 'iorm'

class DB extends BaseModel {
    constructor(store = null) {  // store: 存储对象，默认类名小写下划线
        super({
            db: {
                db_name: 'dbname',  // db_name: 数据库名
                db_version: 1  // db_version: 数据库版本，默认为 1
            },
            store: store  // store: 存储对象，默认类名小写下划线
        })
    }
}

class User extends DB {
    constructor() {
        super({ store_name: 'user_store' })  // store_name: 存储对象名
    }
    id = KeyPathField({ key_path_name: '_id', auto_increment: true })  // key_path_name: 主键名，默认字段名
    username = StringField({ verbose_name: '用户名', nullable: false, unique: true, index: 'name_index' })
    password = StringField({ verbose_name: '密码', nullable: false, unique: false, index: 'name_index' })
    activate = BooleanField({ default: true, unique: false, index: 'activate_index' })
    hobbies = ArrayField({ default: ['football', 'basketball'], unique: false, index: 'hobbies_index' })
}
```

#### 添加数据

```javascript
const user = new User()
user.username = 'admin'
user.password = '123456'
user.hobbies = ['football']

user.insert()  // 主键不能重复，auto_increment: true 自动生成
// OR
user.save()  // 主键重复则修改数据
```

#### 查询数据
    
```javascript
const query = User.find()  // find 等价于 find_many
query = query.filter({ activate: true })  // filter: 过滤条件
// OR
const query = User.filter({ activate: true })  // 或直接使用 filter

query = query.exclude({ username: 'admin' })  // exclude: 排除条件

query = query.skip(10)  // 跳过 10 条数据
query = query.limit(10)  // 查询 10 条数据

console.log(query.all())
```

#### 修改数据
    
```javascript
const query = User.find().filter({ username: 'admin', activate: true }).get() // get: 获取一条数据
if (query) {
    query.username = 'admin2'
    query.save()
}
```

#### 删除数据
    
```javascript
const query = User.find().filter({ username: 'admin', activate: true }).get() // get: 获取一条数据
if (query) {
    query.delete()
}
```
