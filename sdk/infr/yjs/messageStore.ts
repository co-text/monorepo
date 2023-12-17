import {SyncStore} from "@cmmn/sync";
import {cell, Cell} from "@cmmn/cell";
import {compare, Fn, getOrAdd, orderBy, ResolvablePromise, utc} from "@cmmn/core";
import {ContextJSON, MessageJSON} from "@domain";
import {Context, Message} from "@model";
import {Permutation} from "@domain/helpers/permutation";
import {BroadcastSync} from "@infr/yjs/broadcast-sync";

export class MessageStore extends SyncStore{

    // private static provider = new WebRtcProvider([`${location.origin.replace(/^http/, 'ws')}/api`])
    public Sync = new ResolvablePromise();
    @cell
    public IsSynced = false;

    constructor(protected URI: string) {
        super(URI);
        this.context.Set({URI: URI} as any)
    }

    private sync = new BroadcastSync(this['doc'], this.URI);
    public addProvider(){
        // @ts-ignore
        this.store.subscribe(this.doc, this.name);
    }
    @cell
    private messages = this.getSet<string>('messages');

    @cell
    private context = this.getObjectCell<ContextJSON>('context');


    public Init() {
        const state = this.GetState();
        if (!state.Context.URI) {
            this.context.Diff({
                CreatedAt: utc().toISOString(),
                id: this.URI,
                URI: this.URI,
                IsRoot: true,
                UpdatedAt: utc().toISOString(),
            })
        }
        this.Sync.resolve();
        this.IsSynced = true;
    }

    DeleteMessage(item: Pick<Message, "id">) {
        this.messages.delete(item.id)
    }

    AddMessage(item: Message) {
        this.messages.add(item.id);
        this.GetMessageCell(item.id).set(item)
    }

    static clear() {
    }

    GetState(): IState {
        return {
            Context: this.context.Value,
            Messages: this.messages
        };
    }
    public $state = new Cell(() => {
        const state = this.GetState();
        if (!state.Context)
            return Context.FromJSON({URI: this.URI} as any);
        const context = Context.FromJSON(state.Context);
        const ordered = orderBy(state.Messages, x => x);
        context.Messages = context.Permutation?.Invoke(ordered) ?? ordered;
        return context;
    }, {
        compare,
        onExternal: value => {
            value.Permutation = Permutation.Diff(orderBy(value.Messages, x => x), value.Messages);
            this.context.Diff(Context.ToJSON(value));
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

    private messageCells = new Map<string, Cell>();
    GetMessageCell(id: string) {
        return getOrAdd(this.messageCells, id, id => {
            const obj = this.getObjectCell<MessageJSON>(id);
            const objCell = new Cell(obj);
            obj.on('change', e => {
                cell.set(Message.FromJSON(e.value));
            });
            const cell = new Cell(() => {
                const result = objCell.get().Value;
                return result && Message.FromJSON(result);
            }, {
                compare,
                onExternal: value => {
                    obj.Diff(Message.ToJSON(value));
                }
            });
            return cell;
        });
    }
}

export type IState = {
    Context: Readonly<ContextJSON>;
    Messages: ReadonlySet<string>;
};