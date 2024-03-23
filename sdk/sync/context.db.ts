import { IndexedDatabase } from './indexedDatabase'

class ContextDb extends IndexedDatabase<Uint8Array> {
    constructor() {
        super("contexts")
    }
}

export const contextDB = new ContextDb();
