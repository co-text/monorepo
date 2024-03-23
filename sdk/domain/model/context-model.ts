import { MessageModel } from "./message-model";
import { Context } from "@model";
import { ContextStore } from "../../sync/contextStore";
import { Fn, orderBy } from "@cmmn/core";
import { cell } from '@cmmn/cell'
import { Op } from "../../common";
import { Permutation } from "@domain/helpers/permutation";

export class ContextModel {

    Actions = this;
    @cell
    public store: ContextStore = new ContextStore(this.URI);
    public Messages = new MessagesMap(id => MessageModel.get(id, this.URI))

    private constructor(public URI: string) {
    }

    public get State(): Readonly<Context> {
        return this.store.getState();
    }


    @Fn.cache()
    public static get(uri: string): ContextModel {
        return new ContextModel(uri);
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

    public [Op.addMessage](index: number, id: string) {
        const messages = this.State.Messages.slice();
        messages.splice(index, 0, id);
        const perm = Permutation.Diff(orderBy(messages), messages);
        this.store.addMessage(id);
        this.store.Update({Permutation: perm.toString()});
    }

    public [Op.removeMessage](id: string) {
        this.store.deleteMessage({id});
    }

}

export class MessagesMap extends Map<string, MessageModel> {
    constructor(private factory: (id: string) => MessageModel) {
        super();
    }

    get(key: string) {
        const existed = super.get(key);
        if (existed) return existed;
        const newMessage = this.factory(key);
        this.set(key, newMessage);
        return newMessage;
    }
}