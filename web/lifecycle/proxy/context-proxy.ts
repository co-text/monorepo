import {ModelKey, ModelProxy, proxy} from "@cmmn/domain/proxy";
import {Context, Message}from "@cotext/sdk";
import type {IContextActions} from "@cotext/sdk";
import {IMessageProxy, MessageProxy} from "./message-proxy";
import {DomainProxy} from "./domain-proxy";
import {orderBy} from "@cmmn/core";
import {ModelMap} from "./model-map";

export class ContextProxy extends ModelProxy<Context, IContextActions>
    implements IContextProxy{

    get Messages(): ReadonlyArray<IMessageProxy> {
        return this.State?.Messages.map(x => this.MessageMap.get(x)).filter(x => x.State) ?? [];
    }

    get Parents(): ReadonlyArray<IMessageProxy> {
        return orderBy(this.ParentsMap.values(),x => x.State.id);
    }

    MessageMap = new ModelMap(
        this.stream, this.locator, () => this.State.Messages, MessageProxy, x => ["Messages", x]
    )

    @proxy.map<Context>(Message, c => c.Parents.slice())
    ParentsMap: Map<ModelKey, MessageProxy>;

    public CreateMessage(message: Message, index = this.Messages.length): IMessageProxy {
        this.Actions.CreateMessage(message, index);
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
        this.Actions.RemoveMessage(message.State.id);
    }


}
export interface IContextProxy {
    State: Readonly<Context>;
    MessageMap: ModelMap<MessageProxy>;
    get Messages(): ReadonlyArray<IMessageProxy>;

    get Parents(): ReadonlyArray<IMessageProxy>;

    RemoveMessage(message: IMessageProxy): void;
    CreateMessage(message: Message, index?: number): IMessageProxy;
}