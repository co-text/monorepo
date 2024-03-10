import type {Message} from "@cotext/sdk";
import {Fn, utc} from "@cmmn/core";
import {Api} from "../infr/api";
import {DomainProxy, IContextProxy, IMessageProxy} from "@proxy";
export class ContextStore{

    constructor(public readonly URI: string,
                protected readonly api: Api,
                protected readonly proxy: DomainProxy) {
        this.api.joinRoom(URI).then(x => x)
    }


    protected context = this.proxy.getContext(this.URI) as IContextProxy;
    public get Messages() {
        return this.context.Messages
    }
    CreateMessage() {
        this.context.CreateMessage({
            id: Fn.ulid(),
            Content: '',
            CreatedAt: utc(),
            UpdatedAt: utc(),
        } as Message);
    }
}