import { cell } from '@cmmn/cell'
import { Client } from './base/client'
import { Message } from '@model'
import { Fn, utc } from '@cmmn/core'
import { IContextProxy } from "./interfaces/context-proxy";
import { IMessageProxy } from "./interfaces/message-proxy";
import { ContextClient } from "./context.client";

export class MessageClient extends Client<Message> implements IMessageProxy {

    private constructor(uri: string) {
        super();
        this.uri = uri;
    }

    @cell
    private uri: string;

    get id() {
        return this.uri.split('#').pop();
    }

    get path() {
        return this.uri;
    }

    @cell
    public get State() {
        return this.get()
    }

    public get SubContext() {
        return this.State?.SubContextURI ? ContextClient.get(this.State.SubContextURI) : null;
    }

    @Fn.cache()
    public static get(uri: string): MessageClient {
        return new MessageClient(uri);
    }

    AddMessage(message: Message, index?: number): IMessageProxy {
        const context = this.GetOrCreateSubContext();
        return context.CreateMessage(message, index);
    }

    GetOrCreateSubContext(): IContextProxy {
        if (this.SubContext)
            return this.SubContext;
        const id = Fn.ulid();
        const uri = this.State.ContextURI.split('/').slice(0, -1).concat(id).join('/');

        this.patch({SubContextURI: uri});
        const context = this.SubContext;
        context.patch({
            id,
            Messages: [],
            Storage: null,
            UpdatedAt: utc(),
            CreatedAt: utc(),
            IsRoot: false,
            URI: uri,
        });
        return context;
    }

    Merge(message: IMessageProxy): void {
        if (!message.SubContext) return;
        const context = this.GetOrCreateSubContext();
        const toMove = message.SubContext.Messages.slice();
        for (let i = 0; i < toMove.length; i++) {
            let m = toMove[i];
            m.Move(message.SubContext, context, i);
        }
    }

    Move(from: IContextProxy, context: IContextProxy, index: number): IMessageProxy {
        from.RemoveMessage(this.id);
        context.InsertMessage(this.id, index);
        return this;
    }

    UpdateContent(content: string): void {
        this.patch({Content: content});
    }


}