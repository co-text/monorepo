import { nodes, Patch } from "json-joy/es2020/json-crdt-patch";
import { ConNode, Model, ObjNode } from "json-joy/es2020/json-crdt";
import { cell } from "@cmmn/cell";
import { EventEmitter, Fn } from "@cmmn/core";
import { IndexedDatabase } from "./indexedDatabase";
import { ISyncStore } from "./istore";

export class SyncStore<T extends object> extends EventEmitter<{
    patch: Uint8Array
}> implements ISyncStore{
    private db = new IndexedDatabase<Uint8Array>(this.name);
    id = Fn.ulid()
    init = this.db.get('model').then(x => {
        if (x) {
            this.model = Model.fromBinary(x).setSchema(this.schema);
        }
        this.model.api.onLocalChanges.listen(e => {
            const patch = this.model.api.flush();
            this.emit('patch', patch.toBinary());
        });
        this.model.api.onChanges.listen(e => {
            this.db.set('model', this.model.toBinary());
        });
    });
    get clock(){
        return this.model.clock;
    }
    constructor(private schema: TObjBuilder<T>, private name: string) {
        super();
    }
    
    @cell
    public model = Model.withLogicalClock()
        .setSchema(this.schema);
   
    public get<TKey extends keyof T>(key: TKey){
        return this.model.api.node.get(key)
    }

    load(data: Uint8Array) {
        const clone = Model.fromBinary(data).api;
        console.log(clone.view());
        const patch = clone.flush();
        this.model.applyPatch(patch);
    }

    getState() {
        return this.model.toBinary();
    }

    applyPatch(data: Uint8Array) {
        this.model.applyPatch(Patch.fromBinary(data));
        
    }
}


export type TNode<T> =
    T extends string | number | boolean ? ConNode<T>
        : ObjNode<{
            [key in keyof T]: TNode<T[key]>
        }>
type TObjBuilder<T> = nodes.obj<{
    [key in keyof T]: TNodeBuilder<T[key]>
}>
type TNodeBuilder<T> = 
    T extends string | number | boolean ? nodes.con<T>
    : TObjBuilder<T>