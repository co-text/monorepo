import {Context, DomainLocator, IContextActions, IMessageActions, Message} from "@cotext/sdk";
import {ModelLike} from "@cmmn/domain/worker";
import {Injectable, utc} from "@cmmn/core";
import {ContextStore} from "@stores/context.store";
import {Api} from "../infr/api";

@Injectable()
export class CurrentStore extends ContextStore{
    public static URI = 'current';
    constructor(locator: DomainLocator, api: Api) {
        super(CurrentStore.URI, api, locator);
    }
}