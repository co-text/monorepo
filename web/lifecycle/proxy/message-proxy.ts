import {Locator, ModelProxy} from "@cmmn/domain/proxy";
import {Context, DomainState, Message}from "@cotext/sdk";
import type {IMessageActions} from "@cotext/sdk";
import {Fn, utc} from "@cmmn/core";
import type {IContextProxy} from "./context-proxy";
import {ContextProxy} from "./context-proxy";

export class MessageProxy extends ModelProxy<Message, IMessageActions>
    implements IMessageProxy{

    private rootLocator = ('rootLocator' in this.locator) ? this.locator.rootLocator as Locator : this.locator;

    // get Context(): IContextProxy {
    //     return this.rootLocator.get(['Contexts', this.State.ContextURI], ContextProxy) as ContextProxy
    // }

    get SubContext(): IContextProxy {
        return this.State.SubContextURI
            ? this.rootLocator.get(['Contexts', this.State.SubContextURI], ContextProxy) as ContextProxy
            : null;
    }

    public get id(){
        // @ts-ignore
        return this.stream.path.at(-1);
    }
    public get Messages(){
        return this.SubContext?.Messages ?? [];
    }

    public GetOrCreateSubContext(): IContextProxy {
        if (this.SubContext)
            return this.SubContext;
        const id = Fn.ulid();
        if (!this.State.id || !this.State.URI)
            debugger;
        const uri = this.State.URI.split('/').slice(0, -1).concat(id).join('/');
        this.State = {
            ...this.State,
            SubContextURI: uri,
            UpdatedAt: utc()
        };
        this.SubContext.State = {
            id,
            Messages: [],
            Parents: [this.State.id],
            Storage: null,
            UpdatedAt: utc(),
            CreatedAt: utc(),
            IsRoot: false,
            URI: uri,
        } as Context;
        return this.SubContext;
    }

    public AddMessage(message: Message, index = this.SubContext?.Messages.length): IMessageProxy {
        this.GetOrCreateSubContext();
        const messages = [...this.SubContext.State.Messages];
        messages.push(message.id);
        this.SubContext.CreateMessage(message, index);
        this.SubContext.State = {
           ...this.SubContext.State,
           Messages: messages
        };
        // message.ContextURI = this.SubContext.State.URI;
        const result = this.SubContext.MessageMap.get(message.id);
        result.State = message;
        return result;
    }


    public Move(from: IContextProxy, context: IContextProxy, index: number): IMessageProxy {
        if (context !== from) {
            from.State = {
                ...from.State,
                Messages: from.State.Messages.filter(x => x != this.State.id)
            };
            context.State = {
                ...context.State,
                Messages: [
                    ...context.State.Messages.slice(0, index),
                    this.State.id,
                    ...context.State.Messages.slice(index)
                ]
            };
            const result = context.MessageMap.get(this.State.id);
            result.State = this.State;
            return result;
        } else {
            // this.Actions.Reorder(index);
            const messages = from.State.Messages
                .filter(x => x !== this.State.id);
            messages.splice(index, 0, this.State.id);
            from.State = {
                ...from.State,
                Messages: messages
            }
            return this;
        }
    }

    public UpdateContent(content: string){
        // this.Actions.UpdateText(content);
        this.State = {
            ...this.State,
            Content: content,
            UpdatedAt: utc()
        }
    }
    // Remove(): void{
    //     this.Context.RemoveMessage(this);
    // }
    public Merge(message: IMessageProxy): void{
        if (!message.SubContext) return;
        const context = this.GetOrCreateSubContext();
        const toMove = message.SubContext.Messages.slice();
        for (let i = 0; i < toMove.length; i++){
            let m = toMove[i];
            m.Move(message.SubContext, context, i);
        }
    }

}

export interface IMessageProxy {
    get id(): string;
    State: Message;
    // Context: IContextProxy;
    SubContext?: IContextProxy;

    GetOrCreateSubContext(): IContextProxy;

    AddMessage(message: Message, index?: number): IMessageProxy;

    Move(from: IContextProxy, context: IContextProxy, index: number): IMessageProxy;

    UpdateContent(content: string): void;

    Merge(message: IMessageProxy): void;
}
