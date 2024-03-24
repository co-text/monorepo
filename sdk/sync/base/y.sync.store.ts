import { applyUpdateV2, Doc, encodeStateAsUpdateV2, encodeStateVector } from "yjs";
import { EventEmitter, Fn } from "@cmmn/core";
import { IndexedDatabase } from "./indexedDatabase";
import { ISyncStore } from "./istore";

export class YSyncStore<T extends object> extends EventEmitter<{
    patch: Uint8Array;
    change: void;
}> implements ISyncStore{
    private db = new IndexedDatabase<Uint8Array>(this.name);
    id = Fn.ulid()
    init = this.db.get('model').then(x => {
        if (x) {
            this.load(x);
            this.emit('change');
        }
        this.model.on('updateV2', e => {
            this.emit('patch', e);
            this.db.set('model', this.getState());
            this.emit('change');
        });
    });
    get clock(){
        return encodeStateVector(this.model);
    }
    constructor(private name: string) {
        super();
    }
    
    private readonly model = new Doc();
   
    public getObject<TKey extends keyof T & string>(key: TKey): T[TKey] {
        return this.model.getMap(key).toJSON() as T[TKey];
    }
    public getArray<TKey extends keyof T & string>(key: TKey): T[TKey] {
        return this.model.getArray(key).toJSON() as T[TKey];
    }

    load(data: Uint8Array) {
        applyUpdateV2(this.model, data);
    }

    getState() {
        return encodeStateAsUpdateV2(this.model);
    }

    applyPatch(data: Uint8Array, clock: any) {
        applyUpdateV2(this.model, data);
    }

    del(path: keyof T & string, key: string) {
        const arr = this.model.getArray(path);
        const index = arr.toJSON().indexOf(key);
        if (index == -1) return;
        arr.delete(index);
    }
    add(path: keyof T & string, key: string) {
        const arr = this.model.getArray(path);
        arr.push([key]);
    }
    diff(path: keyof T & string, diff: object) {
        const map = this.model.getMap(path);
        this.model.transact(x => {
            for (let key in diff) {
                map.set(key, diff[key]);
            }
        })
    }
}