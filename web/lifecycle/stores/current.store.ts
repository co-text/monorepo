import {DomainLocator} from "@cotext/sdk";
import {Injectable} from "@cmmn/core";
import {ContextStore} from "@stores/context.store";
import {Api} from "../infr/api";

@Injectable()
export class CurrentStore extends ContextStore{
    public static URI = 'current';
    constructor(locator: DomainLocator, api: Api) {
        super(CurrentStore.URI, api, locator);
    }
}