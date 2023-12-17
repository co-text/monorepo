import {BroadcastSync, SyncStore} from "@cmmn/sync";
import {cell, Cell} from "@cmmn/cell";
import {compare, getOrAdd, orderBy, utc} from "@cmmn/core";
import {ContextJSON} from "@domain";
import {Context, Message} from "@model";
import {Permutation} from "@domain/helpers/permutation";
import {MessageStore} from "./messageStore";

export class ContextStore extends SyncStore{

    constructor(protected URI: string) {
        super(URI);
        this.context.Set({
            CreatedAt: utc().toISOString(),
            id: this.URI,
            URI: this.URI,
            IsRoot: true,
            UpdatedAt: utc().toISOString(),
        });
        this.addSync(new BroadcastSync(this.URI));
    }

    @cell
    private messages = this.getSet<string>('messages');

    @cell
    private context = this.getObjectCell<ContextJSON>('context');


    DeleteMessage(item: Pick<Message, "id">) {
        this.messages.delete(item.id)
    }

    async AddMessage(item: Message) {
        if (this.messages.has(item.id))
            return;
        this.messages.add(item.id);
        await this.IsLoaded;
        this.GetMessageStore(item.id).State = item;
    }


    public $state = new Cell(() => {
        if (!this.context.Value)
            return Context.FromJSON({URI: this.URI} as any);
        const permutation = this.context.Value.Permutation ? Permutation.Parse(this.context.Value.Permutation) : null;
        const context = Context.FromJSON(this.context.Value);
        const ordered = orderBy(this.messages, x => x);
        context.Messages = permutation?.Invoke(ordered) ?? ordered;
        return context;
    }, {
        compare,
        onExternal: value => {
            const permutation = Permutation.Diff(
                orderBy(value.Messages, x => x),
                value.Messages
            );
            this.context.Diff({
                ...Context.ToJSON(value),
                Permutation: permutation.toString()
            });
            const existed = new Set(this.messages);
            for (let id of value.Messages) {
                if (existed.has(id)) {
                    existed.delete(id);
                    continue;
                }
                this.AddMessage({
                    id: id,
                    UpdatedAt: utc(),
                    CreatedAt: utc(),
                    Content: '',
                    ContextURI: this.URI
                });
            }
            for (let id of existed){
                this.DeleteMessage({
                    id: id
                })
            }
        }
    })

    private messageCells = new Map<string, MessageStore>();
    GetMessageStore(id: string) {
        return getOrAdd(this.messageCells,  id,id => new MessageStore(this, id));
    }
}

export type IState = {
    Context: Readonly<ContextJSON>;
    Messages: ReadonlySet<string>;
};

