import type {DomainLocator} from "@cotext/sdk";
import {Injectable} from "@cmmn/core";
import {ContextStore} from "@stores/context.store";
import {Api} from "../infr/api";
import {DomainProxy} from "@proxy";

@Injectable()
export class CurrentStore extends ContextStore{
    public static URI = 'current';
    constructor(proxy: DomainProxy, api: Api) {
        super(CurrentStore.URI, api, proxy);
    }
}