import {cell, Cell} from "@cmmn/cell";
import { compare, EventEmitter, Fn, getOrAdd, orderBy, utc } from '@cmmn/core'
import {ContextJSON} from "@domain";
import {Context, Message} from "@model";
import {Permutation} from "@domain/helpers/permutation";
import {MessageStore} from "./messageStore";
import { crdt } from './crdt'
import {contextDB} from "./context.db";
// import { contextDB } from './context.db'
// @ts-ignore
export class ContextStore extends EventEmitter<{change: void}>{
    private channel = new BroadcastChannel(this.URI + ".out");
    constructor(protected URI: string) {
        super();
        // this.addSync(new BroadcastSync(this.URI) as any);
        // activate sync
        window.addEventListener('beforeunload', () => {
        });
        this.model.api.onChanges.listen(async e => {
            const binary = this.model.toBinary();
            await contextDB.set(this.URI, binary);
        });
        this.model.api.onLocalChanges.listen(e => {
            console.log(this.model.api.flush().toBinary());
        });
        contextDB.get(this.URI).then(x => {
            console.log(x);
            this.model = crdt(x);
        });
    }

    public model = crdt();
    private messagesNode = this.model.api.node.get('message');
    public context = this.model.api.node.get('context');

    private get messages(): string[] {
        return Object.keys(this.messagesNode.view()) as string[];
    }

    getState(){
        const value = this.context.view();
        if (!value)
            return Context.FromJSON({URI: this.URI} as any);
        const permutation = value.Permutation ? Permutation.Parse(value.Permutation) : null;
        const context = Context.FromJSON(value);
        const ordered = orderBy(this.messages, x => x);
        context.Messages = permutation?.Invoke(ordered) ?? ordered.slice();
        return context;
    }

    deleteMessage(item: Pick<Message, "id">) {
        this.messagesNode.del([item.id]);
        this.emit('change')
    }

    addMessage(id: string) {
        if (this.messages.includes(id))
            return;
        console.log(id);
        this.messagesNode.set({
            [id]: {Content: ''}
        });
        this.emit('change')
    }

    Update(diff: Partial<ContextJSON>) {
        this.context.set(diff);
        this.emit('change')
    }
}

export type IState = {
    Context: Readonly<ContextJSON>;
    Messages: ReadonlySet<string>;
};

