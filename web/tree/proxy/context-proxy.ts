import {ModelKey, ModelMap, ModelProxy} from "@cmmn/domain/proxy";
import {Context, Message}from "@cotext/sdk";
import type {IContextActions} from "@cotext/sdk";
import {IMessageProxy, MessageProxy} from "./message-proxy";
import {DomainProxy} from "./domain-proxy";
import {orderBy} from "@cmmn/core";

export class ContextProxy extends ModelProxy<Context, IContextActions>
    implements IContextProxy{

    get Messages(): ReadonlyArray<IMessageProxy> {
        return this.State?.Messages.map(x => this.MessageMap.get(x)).filter(x => x.State) ?? [];
    }

    get Parents(): ReadonlyArray<IMessageProxy> {
        return orderBy(this.ParentsMap.values(),x => x.State.id);
    }

    MessageMap: Map<ModelKey, MessageProxy>;

    ParentsMap: Map<ModelKey, MessageProxy>;

    public CreateMessage(message: Message, index = this.Messages.length): IMessageProxy {
        // this.Actions.CreateMessage(message, index);
        this.State = {
            ...this.State,
            Messages: [
                ...this.State.Messages.slice(0, index),
                message.id,
                ...this.State.Messages.slice(index)
            ]
        };
        const result = this.MessageMap.get(message.id);
        result.State = message;
        return result;
    }
    public RemoveMessage(message: IMessageProxy): void{
        this.State = {
            ...this.State,
            Messages: this.State.Messages.filter(x => x !== message.State.id)
        }
    }


}
export interface IContextProxy {
    State: Readonly<Context>;
    MessageMap: ReadonlyMap<ModelKey, IMessageProxy>;
    get Messages(): ReadonlyArray<IMessageProxy>;

    get Parents(): ReadonlyArray<IMessageProxy>;

    RemoveMessage(message: IMessageProxy): void;
    CreateMessage(message: Message, index?: number): IMessageProxy;
}