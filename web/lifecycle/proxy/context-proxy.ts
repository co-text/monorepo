import {ModelKey, ModelMap, ModelProxy} from "@cmmn/domain/proxy";
import {Context, IMessageActions, Message} from "@cotext/sdk";
import type {IContextActions} from "@cotext/sdk";
import {IMessageProxy, MessageProxy} from "./message-proxy";
import {orderBy} from "@cmmn/core";

export class ContextProxy extends ModelProxy<Context, IContextActions>
    implements IContextProxy{

    get Messages(): ReadonlyArray<IMessageProxy> {
        return this.State?.Messages.map(x => this.MessageMap.get(x)).filter(x => x.State) ?? [];
    }

    get Parents(): ReadonlyArray<IMessageProxy> {
        return orderBy(this.ParentsMap.values(),x => x.State.id);
    }

    MessageMap = this.GetSubProxyMap(
        () => this.State.Messages, x => ["Messages", x], MessageProxy as {
            new (...args: any[]): MessageProxy
        }
    );

    ParentsMap: Map<ModelKey, MessageProxy>;

    public CreateMessage(message: Message, index = this.Messages.length): IMessageProxy {
        this.State = {
            ...this.State,
            Messages: [
                ...this.State.Messages.slice(0, index),
                message.id,
                ...this.State.Messages.slice(index)
            ]
        };
        const result = this.MessageMap.get(message.id);
        result.State = {
            ...message,
            ContextURI: this.State.URI
        };
        return result;
    }
    public RemoveMessage(message: IMessageProxy): void{
        this.State = {
            ...this.State,
            Messages:  this.State.Messages.filter(x => x !== message.id)
        }
        // this.Actions.RemoveMessage(message.State.id);
    }


}
export interface IContextProxy {
    State: Readonly<Context>;
    MessageMap: ModelMap<MessageProxy, Message, IMessageActions>;
    get Messages(): ReadonlyArray<IMessageProxy>;

    get Parents(): ReadonlyArray<IMessageProxy>;

    RemoveMessage(message: IMessageProxy): void;
    CreateMessage(message: Message, index?: number): IMessageProxy;
}