import { EventEmitter, orderBy } from '@cmmn/core'
import { ContextJSON, MessageJSON } from "@domain";
import { Context, Message } from "@model";
import { Permutation } from "@domain/helpers/permutation";
import { BroadcastSync } from "./broadcast-sync";
import { YSyncStore } from "./base/y.sync.store";
import { cell } from "@cmmn/cell";
// import { contextDB } from './context.db'
// @ts-ignore
export class ContextStore extends EventEmitter<{ change: void }> {
    private channel = new BroadcastSync(this.URI + ".out", console.warn);
    @cell
    store = new YSyncStore<{
        message: string[];
        context: ContextJSON;
    } & Record<string, MessageJSON>>(this.URI);
    constructor(protected URI: string) {
        super();
        // this.addSync(new BroadcastSync(this.URI) as any);
        // activate sync
        window.addEventListener('beforeunload', () => {
        });
        
        this.channel.listen(this.store);
        // this.store.on('patch', e => {
        //     this.channel
        // });
        // this.model.api.onChanges.listen(async e => {
        //     const binary = this.model.toBinary();
        //     await contextDB.set(this.URI, binary);
        // });
        // this.model.api.onLocalChanges.listen(e => {
        //     console.log(this.model.api.flush().toBinary());
        // });
        // contextDB.get(this.URI).then(x => {
        //     console.log(x);
        //     this.model = crdt(x);
        // });
    }

    // public model = crdt();
    // private messagesNode = this.model.api.node.get('message');
    // public context = this.model.api.node.get('context');

    private get context(): ContextJSON {
        return this.store.getObject('context');
    }

    private get messages(): string[] {
        return this.store.getArray('message') as string[];
    }

    getState() {
        const value = this.context;
        if (!value)
            return Context.FromJSON({URI: this.URI} as any);
        const permutation = value.Permutation ? Permutation.Parse(value.Permutation) : null;
        const context = Context.FromJSON({
            ...value,
            URI: this.URI,
            id: this.URI.split('/').pop()
        });
        const ordered = orderBy(this.messages, x => x);
        context.Messages = permutation?.Invoke(ordered) ?? ordered.slice();
        return context;
    }

    deleteMessage(item: Pick<Message, "id">) {
        this.store.del('message', item.id);
        this.emit('change')
    }

    addMessage(id: string) {
        if (this.messages.includes(id))
            return;
        console.log(id);
        this.store.add('message', id);
        this.emit('change')
    }

    Update(diff: Partial<ContextJSON>) {
        this.store.diff('context', diff);
        this.emit('change')
    }
}

export type IState = {
    Context: Readonly<ContextJSON>;
    Messages: ReadonlySet<string>;
};

