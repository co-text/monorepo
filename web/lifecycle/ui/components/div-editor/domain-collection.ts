import {MessageItem} from "./message-item";
import {IContextProxy, IMessageProxy} from "@proxy";
import {Fn, getOrAdd} from "@cmmn/core";

export class DomainCollection {
    static MaxDepth = 5;

    constructor(private root: IContextProxy) {
    }

    public [Symbol.iterator](): IterableIterator<MessageItem> {
        return this.iterate(this.root);
    }

    private* iterate(context: IContextProxy, path = [],
                     counter = {index: 0},
                     parent: MessageItem = null): IterableIterator<MessageItem> {
        for (let msg of context.Messages) {
            const item = this.getItem(msg, [...path, msg.id], parent, context);
            yield item;
            if (item.IsOpened && item.Message.SubContext) {
                for (let treeItem of this.iterate(item.Message.SubContext, item.path, counter, item)) {
                    yield treeItem;
                }
            }
        }
    }

    private itemCache = new Map<string, MessageItem>();
    private getItem(msg: IMessageProxy, path = [], parent: MessageItem = null, context: IContextProxy): MessageItem {
        if (!msg)
            return undefined;
        const level = path.length - 1;
        return getOrAdd(this.itemCache, path.join(':'),
            () => new MessageItem(msg, path, level, parent, context, this)
        );
    }

    public findItem(path: string[]){
        return this.itemCache.get(path.join(':'))
    }

    addAfter(item: MessageItem, text: string) {
        const context = item.Message.SubContext ?? item.context;
        const index = item.Message.SubContext ? 0 : item.index + 1;
        const id = Fn.ulid();
        context.CreateMessage({
            Content: text,
            id,
            URI: context.State.URI.replace(context.State.id, id),
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
        }, index);
    }

    addLast(text: string){
        const id = Fn.ulid();
        this.root.CreateMessage({
            Content: text,
            id,
            URI: this.root.State.URI.replace(this.root.State.id, id),
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
        });
    }

}

