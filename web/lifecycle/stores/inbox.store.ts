import {Injectable} from "@cmmn/core";
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
        // this.context.MessageMap.get(id).MoveTo(this.client.getContext(CurrentStore.URI), 0)
    }
}