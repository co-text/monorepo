import {MessageItem} from "./message-item";
import {IContextProxy, IMessageProxy} from "@cotext/sdk/client";
import {Fn, getOrAdd} from "@cmmn/core";

export class DomainCollection {
    static MaxDepth = 5;

    constructor(private root: IContextProxy) {
    }

    public [Symbol.iterator](): IterableIterator<MessageItem> {
        return this.iterate(this.root);
    }

    protected *iterate(context: IContextProxy, parent: MessageItem = null): IterableIterator<MessageItem> {
        for (let msg of context.Messages) {
            const item = MessageItem.getOrAdd(msg, parent?.path ?? [], context)
            yield item;
            if (!item.IsOpened) continue;
            if (!msg.SubContext) continue;
            for (let treeItem of this.iterate(msg.SubContext, item)) {
                yield treeItem;
            }
        }
    }
    addChild(item: MessageItem, text: string, index: number): MessageItem {
        const context = item?.Message.GetOrCreateSubContext() ?? this.root;
        const id = Fn.ulid();
        const message = context.CreateMessage({
            ContextURI: context.State.URI,
            Content: text,
            id,
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
        }, index);
        return MessageItem.getOrAdd(
          message,
          item?.path ?? [],
          context,
        );
    }

    addBefore(item: MessageItem, text: string) {
        return this.addChild(item.parent, text, item.index);
    }

    addAfter(item: MessageItem, text: string) {
        const index = item.Message.SubContext ? 0 : item.index + 1;
        const parent = item.Message.SubContext ? item : item.parent;
        return this.addChild(parent, text, index);
    }

    addLast(text: string){
        const id = Fn.ulid();
        this.root.CreateMessage({
            ContextURI: this.root.State.URI,
            Content: text,
            id,
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
        });
    }

}

