import {cell, Cell} from "@cmmn/cell";
import { compare, EventEmitter, Fn, getOrAdd, orderBy, utc } from '@cmmn/core'
import {ContextJSON} from "@domain";
import {Context, Message} from "@model";
import {Permutation} from "@domain/helpers/permutation";
import {MessageStore} from "./messageStore";
import { crdt } from './crdt'
import { contextDB } from './context.db'
// @ts-ignore
export class ContextStore extends EventEmitter<{change: void}>{
    private channel = new BroadcastChannel(this.URI + ".out");
    constructor(protected URI: string) {
        super();
        // this.addSync(new BroadcastSync(this.URI) as any);
        // activate sync
        this.$state.active();
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

        });
    }
    public model = crdt();
    private messagesNode = this.model.api.node.get('message');

    private context = this.model.api.node.get('context');

    private get messages(): string[] {
        return Object.keys(this.messagesNode.view()) as string[];
    }

    DeleteMessage(item: Pick<Message, "id">) {
        this.messagesNode.del([item.id]);
    }

    AddMessage(id: string) {
        if (this.messages.includes(id))
            return;
        this.messagesNode.set({
            [id]: {Content: ''}
        });
    }

    private getState(){
        const value = this.context.view();
        if (!value)
            return Context.FromJSON({URI: this.URI} as any);
        const permutation = value.Permutation ? Permutation.Parse(value.Permutation) : null;
        const context = Context.FromJSON(value);
        const ordered = orderBy(this.messages, x => x);
        context.Messages = permutation?.Invoke(ordered) ?? ordered.slice();
        return context;
    }

    private onStateChange(value: Context){
        const permutation = Permutation.Diff(
            orderBy(value.Messages, x => x),
            value.Messages
        );
        this.context.set({
            ...Context.ToJSON(value),
            Permutation: permutation.toString()
        });
        const existed = new Set(this.messages);
        for (let id of value.Messages) {
            if (existed.has(id)) {
                existed.delete(id);
                continue;
            }
            this.AddMessage(id);
        }
        for (let id of existed){
            this.DeleteMessage({
                id: id
            })
        }
        this.emit('change');
    }

    public $state = new Cell(() => this.getState(), {
        compare,
        onExternal: value => this.onStateChange(value)
    })

    private messageCells = new Map<string, MessageStore>();
    GetMessageStore(id: string) {
        if (!this.messages.includes(id)){
            this.messagesNode.set({
                [id]: {}
            });
            this.emit('change');
        }
        return getOrAdd(this.messageCells,  id,id => new MessageStore(this, id));
    }
}

export type IState = {
    Context: Readonly<ContextJSON>;
    Messages: ReadonlySet<string>;
};

