import {EditorItem} from "./types";
import {IContextProxy, IMessageProxy} from "@proxy";
import {DomainCollection} from "./domain-collection";

export class MessageItem implements EditorItem {

    id = this.path.join(':');

    get Content() {
        return new Array(this.level).fill(' ').join('') + (this.Message.State?.Content ?? '');
    }

    get index(){
        return this.context.State.Messages.indexOf(this.Message.id);
    }

    set Content(value: string) {
        let level = value.match(/^[\s◦]*/)[0].length;
        value = value.substring(level);
        if (level > this.level){
            const prev = this.context.Messages[this.index - 1];
            if (!prev)
                return;
            const subContext = prev.GetOrCreateSubContext();
            this.Message = this.Message.Move(this.context, subContext, subContext.Messages.length);
        } else if (level < this.level) {
            let target: MessageItem = this;
            while (level < this.level){
                target = target?.parent;
                level++;
            }
            this.Message = this.Message.Move(this.context, target.context, target.index + 1);
        }
        this.Message.UpdateContent(value);
    }

    Delete() {
        this.context.RemoveMessage(this.Message);
    }

    IsOpened = this.level < DomainCollection.MaxDepth;
    Length = 1;

    constructor(public Message: IMessageProxy,
                public path: string[],
                public level: number,
                public parent: MessageItem,
                public context: IContextProxy) {
    }
}