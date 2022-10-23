import { IORMConfigDatabase } from "../types/index"


/**
 * DB
 */
class DB {
    private readonly iorm_type: string = 'db'
    name: string
    version: number = 1
    constructor(config: IORMConfigDatabase) {
        this.name = config.name
        this.version = config.version
    }
}

export default DB
