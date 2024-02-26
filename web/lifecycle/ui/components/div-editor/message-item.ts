import {IContextProxy, IMessageProxy} from "@proxy";
import {DomainCollection} from "./domain-collection";

export class MessageItem {

    constructor(public Message: IMessageProxy,
                public path: string[],
                public level: number,
                public parent: MessageItem,
                public context: IContextProxy,
                public domain: DomainCollection) {
    }

    get id() {
        return this.path.join(':');
    }

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
        return this.domain.findItem(this.path.slice(0,-1).concat(message.id));
    }
    get previous(){
        if (this.index == 0)
            return this.parent;
        return this.prevSibling;
    }
    get next(){
        if (this.Message.SubContext?.Messages.length)
            return this.domain.findItem(this.path.concat(this.Message.SubContext.Messages[0].id));
        return this.nextClosed;
    }
    get nextClosed(){
        return this.nextSibling ?? this.parent.nextClosed;
    }

    get nextSibling(){
        if (this.index == this.context.Messages.length - 1)
            return null;
        const message = this.context.Messages[this.index + 1];
        return this.domain.findItem(this.path.slice(0,-1).concat(message.id));
    }

    Delete() {
        this.context.RemoveMessage(this.Message);
    }

    IsOpened = this.level < DomainCollection.MaxDepth;
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
}