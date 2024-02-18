import {MessageModel} from "./message-model";
import type {IContextActions} from "@cotext/sdk";
import {Context, Message}from "@cotext/sdk";
import type {ModelLike} from "@cmmn/domain/worker";
import {ContextStore} from "../../sync/contextStore";
import {Fn, getOrAdd, remove} from "@cmmn/core";
import {DomainLocator} from "@domain/model/domain-locator.service";

export class ContextModel implements ModelLike<Context, IContextActions>, IContextActions {

    Actions = this;
    public contextStore: ContextStore = new ContextStore(this.URI);
    constructor(public URI: string, private locator: DomainLocator) {
    }

    public Messages = new MessagesMap( id => new MessageModel(this.locator, this.contextStore.GetMessageStore(id), id))

    public get State(): Readonly<Context> {
        return this.contextStore.$state.get();
    }

    public set State(value: Readonly<Context>) {
        this.contextStore.$state.set(value);
    }

    public* getParents(): IterableIterator<MessageModel> {
        // @ts-ignore
        for (let context of this.locator.root.Contexts.values()) {
            for (let message of context.Messages.values()) {
                if (message.SubContext === this)
                    yield message;
            }
        }
    }


    async CreateMessage(message: Message, index: number = this.State.Messages.length) {
        message.id ??= Fn.ulid();
        message.URI ??= this.URI.replace(this.State.id, message.id);
        // if (message.ContextURI && message.ContextURI !== this.URI) {
        //     this.locator.Root.Contexts.get(message.ContextURI).RemoveMessage(message.id);
        // }
        // message.ContextURI = this.URI;
        const messages = this.State.Messages.slice();
        remove(messages, message.id);
        messages.splice(index, 0, message.id);
        this.State = {
            ...this.State,
            Messages: messages
        }
        const messageModel = this.Messages.get(message.id);
        messageModel.State = message;

    };

    ReorderMessage(message: MessageModel, toIndex) {
        const messages = this.State.Messages.filter(x => x !== message.id);
        messages.splice(toIndex, 0, message.id);
        this.State = {
            ...this.State,
            Messages: messages
        }
    };

    async RemoveMessage(id: string): Promise<void> {
        this.State = {
            ...this.State,
            Messages: this.State.Messages.filter(x => x !== id)
        }
    };

}

export class MessagesMap extends Map<string, MessageModel> {
    constructor(private factory: (id: string) => MessageModel) {
        super();
    }

    get(key: string){
        const existed = super.get(key);
        if (existed) return existed;
        const newMessage = this.factory(key);
        this.set(key, newMessage);
        return newMessage;
    }
}