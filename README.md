[简体中文](./docs/zh_CN/README.md)|[English](./docs/en_US/README.md)

> 正式版版本号将大于 "1.0.0"，当前 "0.0.10"
> 
> The official version number will be greater than '1.0.0', and the current version number is '0.0.10'.

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
    
```javascript
const query = User.find_one({username: 'admin'})
console.log(query.get())
```

#### 修改数据
    
```javascript
const user = User.find().filter({ username: 'admin', activate: true }).obj() // obj|object: 获取一条数据实例
if (user) {
    query.username = 'admin2'
    query.save()
}

const users = User.find().filter({ username: 'admin', activate: true }).objs() // objs|objects: 获取多条数据实例
users.forEach(user => {
    user.username = 'admin2'
    user.save()
})
```

#### 删除数据
    
```javascript
const res = User.find().filter({ username: 'admin', activate: true }).delete()
console.log(res)  // 返回被删除的数据
```

## 内置类型

```typescript
export interface FieldProperty {
    verbose_name?: string
    nullable?: boolean
    default?: any[]
    unique?: boolean
    index?: string | false
}
```

| 字段名       | 类型            | 必须 | 默认值 | 描述                               |
| ------------ | --------------- | ---- | ------ | ---------------------------------- |
| verbose_name | string          | N    | ''     | 字段描述                           |
| nullable     | boolean         | N    | false  | 是否允许为空                       |
| default      | any             | N    |        | 默认值，根据字段类型有不同的默认值 |
| unique       | boolean         | N    | false  | 唯一                               |
| index        | string 或 false | N    | false  | string: 索引名；false: 不创建索引  |

```typescript
export interface IORMConfigDatabase {
    db_name: string
    db_version: number | null | undefined
}

export interface IORMConfigStore {
    store_name: string | null | undefined
}

export interface IORMConfigSetting {
    default_type: 'data' | 'object' | 'key'
}

export interface IORMConfig {
    db: IORMConfigDatabase
    store?: IORMConfigStore | null | undefined
    setting?: IORMConfigSetting | null | undefined
}
```

## 字段类型

```typescript
KeyPathField(property: FieldProperty): Field

InteagerField(property: FieldProperty): Field  // default: 0
StringField(property: FieldProperty): Field  // default: ''
BooleanField(property: FieldProperty): Field  // default: true
ArrayField(property: FieldProperty): Field  // default: []
ObjectField(property: FieldProperty): Field  // default: {}
```

## Model 实例方法

```typescript
/**
 * 保存数据，keypath 不存在则新建数据
 * ret {'id' | 'data' | 'object'} [default: 'id'] 返回数据类型，keypath|json|object
 * @returns {Promise<any>}
 */
save(ret: 'id' | 'data' | 'object' = 'id'): Promise<any>

/**
 * 新建数据
 * ret {'id' | 'data' | 'object'} [default: 'id'] 返回数据类型，keypath|json|object
 * @returns {Promise<any>}
 */
insert(ret: 'id' | 'data' | 'object' = 'id'): Promise<any>
```

## Model 类方法

```typescript
/**
 * 新建数据
 * data {object} 数据 (只取模型中定义的数据)
 * ret {'id' | 'data' | 'object'} [default: 'id'] 返回数据类型，keypath|json|object
 * @returns {Promise<any>}
 */
insert(data: object, ret: 'id' | 'data' | 'object' = 'id'): Promise<any>

/**
 * 查询条件
 * @returns {QuerySet}
 */
where(filter: object = {}): QuerySet

/**
 * 排除条件
 * @returns {QuerySet}
 */
exclude(exclude: object): QuerySet

/**
 * 跳过数据条数
 * @returns {QuerySet}
 */
skip(skip: number): QuerySet

/**
 * 查询数据条数
 * @returns {QuerySet}
 */
limit(limit: number): QuerySet

/**
 * 排序，next | 1 : 正序; prev | -1 : 倒序
 * 当前只支持一个排序字段
 * @returns {QuerySet}
 */
order(order: object = null): QuerySet

/**
 * 字段过滤 1: 过滤; 其他: 不过滤
 * @returns {QuerySet}
 */
filter(filter: object = null): QuerySet

/**
 * 获取符合条件的所有数据
 * @returns {Promise<any>}
 */
all(): Promise<any>

/**
 * 获取一条数据
 * @returns {Promise<any>}
 */
get(): Promise<any>

/**
 * 获取一条数据实例
 * @returns {Promise<any>}
 */
obj(): Promise<any>
object(): Promise<any>

/**
 * 获取多条数据实例
 * @returns {Promise<any>}
 */
objs(): Promise<any>
objects(): Promise<any>

/**
 * 动态设置数据库名，null | undefined 获取数据库名
 * @returns {QuerySet | string}
 */
db(val: string | IORMConfigDatabase | null | undefined = null): QuerySet | string

/**
 * 动态设置仓库名，null | undefined 获取仓库名
 * @returns {QuerySet | string}
 */
store(val: string | IORMConfigStore | null | undefined = null): QuerySet | string
```

## QuerySet 方法

```typescript
/**
 * 查询条件
 * @returns {QuerySet}
 */
where(filter: object = {}): QuerySet

/**
 * 排除条件
 * @returns {QuerySet}
 */
exclude(exclude: object): QuerySet

/**
 * 跳过数据条数
 * @returns {QuerySet}
 */
skip(skip: number): QuerySet

/**
 * 查询数据条数
 * @returns {QuerySet}
 */
limit(limit: number): QuerySet

/**
 * 排序，next | 1 : 正序; prev | -1 : 倒序
 * 当前只支持一个排序字段
 * @returns {QuerySet}
 */
order(order: object = null): QuerySet

/**
 * 字段过滤 1: 过滤; 其他: 不过滤
 * @returns {QuerySet}
 */
filter(filter: object = null): QuerySet

/**
 * 获取符合条件的所有数据
 * @returns {Promise<any>}
 */
all(): Promise<any>

/**
 * 获取一条数据
 * @returns {Promise<any>}
 */
get(): Promise<any>

/**
 * 获取一条数据实例
 * @returns {Promise<any>}
 */
obj(): Promise<any>
object(): Promise<any>

/**
 * 获取多条数据实例
 * @returns {Promise<any>}
 */
objs(): Promise<any>
objects(): Promise<any>

/**
 * 动态设置数据库名，null | undefined 获取数据库名
 * @returns {QuerySet | string}
 */
db(val: string | IORMConfigDatabase | null | undefined = null): QuerySet | string

/**
 * 动态设置仓库名，null | undefined 获取仓库名
 * @returns {QuerySet | string}
 */
store(val: string | IORMConfigStore | null | undefined = null): QuerySet | string
```
