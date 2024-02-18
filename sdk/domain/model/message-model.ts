import {IMessageActions} from "@domain/contracts/actions";
import {Context, Message}from "@cotext/sdk";
import {ModelLike} from "@cmmn/domain/worker";
import {ContextModel} from "./context-model";
import {DomainLocator} from "@domain/model/domain-locator.service";
import {MessageStore} from "../../sync/messageStore";

export class MessageModel implements ModelLike<Message, IMessageActions>, IMessageActions {

    Actions = this;

    // public get Context(): ContextModel {
    //     return this.locator.GetContext(this.store.State.ContextURI);
    // }

    public get SubContext() {
        return this.store.State?.SubContextURI
            ? this.locator.GetOrCreateContext(this.store.State.SubContextURI, this.State.URI) // TODO: this.id
            : null;
    }


    constructor(private readonly locator: DomainLocator,
                private store: MessageStore,
                public id: string) {

    }

    public get State() {
        return this.store.State;
    }

    public set State(value: Readonly<Message>) {
        if (!value.id || !value.URI){
            debugger;
        }
        this.store.State = value;
    }


    async UpdateText(text: string): Promise<void> {
        this.State = {
            ...this.State,
            UpdatedAt: new Date(),
            Content: text
        };
    }


    async Attach(uri: string): Promise<void> {
        this.State = {
            ...this.State,
            UpdatedAt: new Date(),
            SubContextURI: uri
        };
    }

    async Move(fromURI, toURI, toIndex: number) {
        if (fromURI == toURI)
            return await this.Reorder(toIndex, fromURI);
        const state = {
            ...this.State,
            UpdatedAt: new Date(),
            Context: {
                URI: toURI
            } as Context
        };
        const oldContext = this.locator.GetOrCreateContext(fromURI, null);
        if (oldContext) {
            await oldContext.Actions.RemoveMessage(this.id);
        }
        const newContext = this.locator.GetOrCreateContext(toURI, null);
        await newContext.Actions.CreateMessage(state, toIndex);
    }


    async Reorder(newOrder: number, contextURI: string): Promise<void> {
        const context = this.locator.GetContext(contextURI);
        if (!context)
            return;
        context.Actions.ReorderMessage(this, newOrder);
    }

    async Remove(contextURI: string): Promise<void> {
        const context = this.locator.GetContext(contextURI);
        await context.RemoveMessage(this.id);
    }

    async CreateSubContext(uri: string, parentURI: string): Promise<void>{
        this.State = {
            ...this.State,
            SubContextURI: uri
        };
        await this.locator.Root.CreateContext(uri, parentURI);
    }
}

