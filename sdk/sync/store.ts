import { SyncStore } from '@cmmn/sync'
import { ContextJSON } from '@domain'

export class Store extends SyncStore {
    constructor() {
        super('ctx');
    }

    private contexts = this.getArray<ContextJSON>('contexts');

}