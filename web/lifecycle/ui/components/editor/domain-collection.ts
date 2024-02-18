import {EditorItem, EditorItemCollection} from "./types";
import {Cell} from "@cmmn/cell";
import {MessageItem} from "./message-item";
import {IContextProxy, IMessageProxy} from "@proxy";
import {MessageModel} from "@cotext/sdk";
import {getOrAdd} from "@cmmn/core";

export class DomainCollection  implements EditorItemCollection {
    static MaxDepth = 5;

    constructor(private root: IContextProxy) {
    }

    subscribe(cb: () => void) {
        return Cell.OnChange(() => Array.from(this), cb) as () => void;
    }

    public [Symbol.iterator](): IterableIterator<EditorItem> {
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
            () => new MessageItem(msg, path, level, parent, context)
        );
    }
    private getMessageItemById(path: string[], root = this.root): MessageItem {
        return this.itemCache.get(path.join(':'));
    }

    add(item: EditorItem, after: EditorItem, before: EditorItem) {
        const afterItem = this.getMessageItemById(after.path);
        const context = afterItem?.Message.SubContext ?? afterItem?.context ?? this.root;
        const index = afterItem?.Message.SubContext ? 0 : (afterItem?.index ?? -1) + 1;
        const id = item.path.at(-1);
        const newMessage = context.CreateMessage({
            Content: item.Content.replace(/^\s+/, ''),
            id,
            URI: context.State.URI.replace(context.State.id, id),
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
        }, index);
        this.getItem(newMessage, item.path, afterItem?.Message.SubContext ? afterItem : afterItem?.parent, context);
    }

    public remove(item: MessageItem) {
        item.Delete();
    }

    moveBefore(before: EditorItem, item: EditorItem): void {
        const message = this.findItem(item);
        if (before) {
            const itemBefore = this.findItem(before);
            message.Message.Move(message.context, itemBefore.context, itemBefore.context.State.Messages.indexOf(itemBefore.Message.id));
        }else{
            message.Message.Move(message.context, this.root, this.root.Messages.length);
        }
    }

    findItem(item: EditorItem): MessageItem {
        if (!item) return undefined;
        return this.itemCache.get(item.path.join(':'));
    }

}

