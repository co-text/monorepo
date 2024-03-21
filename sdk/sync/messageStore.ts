import {cell} from "@cmmn/cell";
import {Message} from "@model";
import {ContextStore} from "./contextStore";
import { ObjApi } from 'json-joy/es2020/json-crdt'
import { MessageJSON } from '@domain'
import { EventEmitter } from '@cmmn/core'

export class MessageStore extends EventEmitter<{change: void}>{
    constructor(private contextStore: ContextStore, private id: string) {
        super();
        console.log(this.id);
    }

    @cell
    public json = this.contextStore.model.api.node.get('message').get(this.id) as ObjApi<any>;

    public get State() {
        return Message.FromJSON(this.json.view() as any)
    }

    public set State(message: Message) {
        this.json.set(Message.ToJSON(message))
        this.emit('change');
    }

    public dispose(){
    }
}