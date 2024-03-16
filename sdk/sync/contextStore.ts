import {BroadcastSync, SyncStore} from "@cmmn/sync";
import {AsyncCell, cell, Cell} from "@cmmn/cell";
import {compare, Fn, getOrAdd, orderBy, utc} from "@cmmn/core";
import {ContextJSON} from "@domain";
import {Context, Message} from "@model";
import {Permutation} from "@domain/helpers/permutation";
import {MessageStore} from "./messageStore";
import {CRuntime} from "@collabs/collabs";

export class ContextStore extends SyncStore{
    constructor(protected URI: string, private session: string) {
        super(URI, `${session}.${URI}`);
        this.addSync(new BroadcastSync(this.URI+'.out'));
        // activate sync
        this.$state.active();
    }
    @cell
    private messages = this.getSet<string>('messages');

    @cell
    private context = this.getObjectCell<ContextJSON>('context');


    DeleteMessage(item: Pick<Message, "id">) {
        this.messages.delete(item.id);
    }

    AddMessage(id: string) {
        if (this.messages.has(id))
            return;
        this.messages.add(id);
    }

    private getState(){
        if (!this.context?.Value || !this.context.Value.URI)
            return Context.FromJSON({
                URI: this.URI,
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString(),
            });
        const permutation = this.context.Value.Permutation ? Permutation.Parse(this.context.Value.Permutation) : null;
        const context = Context.FromJSON(this.context.Value);
        const ordered = orderBy(this.messages, x => x);
        context.Messages = permutation?.Invoke(ordered) ?? ordered.slice();
        return context;
    }

    private onStateChange(value: Context){
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
            this.AddMessage(id);
        }
        for (let id of existed){
            this.DeleteMessage({
                id: id
            })
        }
    }

    public $state = new Cell(() => this.getState(), {
        compare,
        onExternal: value => this.onStateChange(value)
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

