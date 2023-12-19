import type {DomainLocator, Message} from "@cotext/sdk";
import {Injectable} from "@cmmn/core";
import {CurrentStore} from "@stores/current.store";
import {ContextStore} from "@stores/context.store";
import {Api} from "../infr/api";
import {DomainProxy} from "@proxy";

@Injectable()
export class InboxStore extends ContextStore{
    public static URI = 'inbox';
    constructor(proxy: DomainProxy, api: Api) {
        super(InboxStore.URI, api, proxy);
    }

    MoveToCurrent(id: string) {
        this.context.MessageMap.get(id).MoveTo(this.proxy.getContext(CurrentStore.URI), 0)
    }
}