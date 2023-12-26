import {EventEmitter, Fn} from "@cmmn/core";
import {EditorItem, EditorItemCollection} from "./types";
import {IContextProxy, IMessageProxy} from "@proxy";

export class DomainCollection extends EventEmitter<any> implements EditorItemCollection {
    static MaxDepth = 5;

    constructor(private root: IContextProxy) {
        super();
    }

    public [Symbol.iterator](): IterableIterator<EditorItem> {
        return this.iterate(this.root);
    }

    private* iterate(context: IContextProxy, path = [],
                     counter = {index: 0},
                     parent: EditorItem = null): IterableIterator<EditorItem> {
        for (let msg of context.Messages) {
            const item = this.getItem(msg);
            yield item;
            if (item.IsOpened && item.Message.SubContext) {
                for (let treeItem of this.iterate(item.Message.SubContext, item.Path, counter, item)) {
                    yield treeItem;
                }
            }
        }
    }

    private getItem(msg: IMessageProxy, path = []): MessageItem {
        if (!msg)
            return undefined;
        const level = path.length;
        const newPath = [...path, msg.id];
        return {
            Message: msg,
            id: newPath.join(':'),
            get Content() {
                return this.Message.State?.Content;
            },
            set Content(value: string) {
                this.Message.UpdateContent(value);
            },
            Path: newPath,
            IsOpened: level < DomainCollection.MaxDepth,
            Length: 1,
        };
    }
    private getMessageById(path: string[], root = this.root): IMessageProxy {
        const exist = root.MessageMap.has(path[0]);
        if (!exist) return  undefined;
        const message = root.MessageMap.get(path[0]);
        if (path.length == 1)
            return message;
        return this.getMessageById(path.slice(1), message.SubContext);
    }

    public addBefore(before: EditorItem, item: EditorItem) {
        const context = before ? this.getMessageById(before.id.split(':')).Context : this.root;
        context.CreateMessage({
            Content: item.Content,
            id: item.id.split(':').pop(),
            ContextURI: context.State.URI,
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
        });
    }

    public remove(item: EditorItem) {
        const message = this.getMessageById(item.id.split(':'));
        message.Context.RemoveMessage(message);
    }

    moveBefore(before: EditorItem, item: EditorItem): void {
        const message = this.findItem(item).Message;
        if (before) {
            const messageBefore = this.findItem(before).Message;
            message.MoveTo(messageBefore.Context, messageBefore.Context.Messages.indexOf(messageBefore));
        }else{
            message.MoveTo(this.root, this.root.Messages.length);
        }
    }

    findItem(item: EditorItem): MessageItem {
        if (!item) return undefined;
        const message = this.getMessageById(item.id.split(':'));
        return this.getItem(message);
    }

}

type MessageItem = EditorItem & {
    Index?: number;
    Parent?: EditorItem;
    Path: string[];
    Message: IMessageProxy;
    IsOpened: boolean;
    Length: number;
}
