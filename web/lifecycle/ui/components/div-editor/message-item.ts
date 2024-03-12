import {IContextProxy, IMessageProxy} from "@proxy";
import { cell } from '@cmmn/cell'

export class MessageItem {
    private constructor(public Message: IMessageProxy,
                public readonly parentPath: ReadonlyArray<string>,
                public readonly context: IContextProxy) {
        MessageItem.cache.set(this.id, this);
    }
    path = [...this.parentPath, this.Message.id];
    parent = MessageItem.cache.get(this.path.slice(0, -1).join(':'));
    level =  this.path.length;
    id = this.path.join(':');

    @cell
    IsOpened = this.level < 10;

    get Content() {
        return this.Message.State?.Content ?? '';
    }

    get index(){
        return this.context.State.Messages.indexOf(this.Message.id);
    }

    set Content(value: string) {
        this.Message.UpdateContent(value);
    }
    get prevSibling(){
        if (this.index == 0)
            return null;
        const message = this.context.Messages[this.index - 1];
        return MessageItem.cache.get(this.path.slice(0,-1).concat(message.id).join(':'));
    }
    get previous(){
        if (this.index == 0)
            return this.parent;
        return this.prevSibling;
    }
    get next(){
        if (this.Message.SubContext?.Messages.length)
            return MessageItem.cache.get(this.path.concat(this.Message.SubContext.Messages[0].id).join(':'));
        return this.nextClosed;
    }
    get nextClosed(){
        return this.nextSibling ?? this.parent.nextClosed;
    }

    get nextSibling(){
        if (this.index == this.context.Messages.length - 1)
            return null;
        const message = this.context.Messages[this.index + 1];
        return MessageItem.cache.get(this.path.slice(0,-1).concat(message.id).join(':'));
    }

    Delete() {
        this.context.RemoveMessage(this.Message);
    }

    moveLeft(){
        this.Message = this.Message.Move(this.context, this.parent.context, this.parent.index + 1);
        const newPath = this.path.slice();
        newPath.splice(-2, 1);
        return newPath.join(':');
    }
    moveRight(){
        const prev = this.context.Messages[this.index - 1];
        if (!prev)
            return;
        const subContext = prev.GetOrCreateSubContext();
        this.Message = this.Message.Move(this.context, subContext, subContext.Messages.length);
        const newPath = this.path.slice();
        newPath.splice(-1, 0, prev.id);
        return newPath.join(':');
    }

    moveUp(){
        if (this.index == 0) return;
        this.Message.Move(this.context, this.context, this.index - 1);
    }

    moveDown(){
        if (this.index == this.context.Messages.length - 1) return;
        this.Message.Move(this.context, this.context, this.index + 1);
    }


    public static cache = new Map<string, MessageItem>();
    static getOrAdd (message: IMessageProxy, parentPath: any[], context: IContextProxy) {
        return MessageItem.cache.get([...parentPath, message.id].join(':'))
            ?? new MessageItem(message, parentPath, context);
    }
}