import { Message } from "@model";
import { ContextStore } from "./contextStore";
import { EventEmitter } from '@cmmn/core'
import { MessageJSON } from "@domain";

export class MessageStore extends EventEmitter<{ change: void }> {
    constructor(private contextStore: ContextStore, private id: string) {
        super();
        console.log(this.id);
    }


    public get State() {
        return this.contextStore.store.getObject(this.id) as MessageJSON;
    }

    public set(message: Partial<Message>) {
        this.contextStore.store.diff(this.id, Message.ToJSON(message))
        this.emit('change');
    }

    public dispose() {
    }
}