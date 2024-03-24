import { Message } from "@model";
import { ContextModel } from "./context-model";
import { MessageStore } from "../../sync/messageStore";
import { cell } from '@cmmn/cell'
import { Op } from "../../common";
import { compare } from "@cmmn/core";

export class MessageModel {

    public static get(id: string, contextURI: string): MessageModel {
        return new MessageModel(id, contextURI);
    }

    Actions = this;


    public get SubContext() {
        return this.store.State?.SubContextURI
            ? ContextModel.get(this.store.State.SubContextURI)
            : null;
    }

    @cell
    public contextURI: string;

    public get Context() {
        return ContextModel.get(this.contextURI);
    }

    @cell
    private get store(): MessageStore {
        return new MessageStore(this.Context.store, this.id);
    }

    private constructor(public id: string, contextURI: string) {
        this.contextURI = contextURI;
    }

    @cell({compare})
    public get State() {
        return this.store.State;
    }

    public [Op.patch](diff: Partial<Message>) {
        this.store.set(diff);
    }

}

