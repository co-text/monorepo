import {DomainLocator, Message} from "@cotext/sdk";
import {Injectable, utc} from "@cmmn/core";
import {CurrentStore} from "@stores/current.store";
import {ContextStore} from "@stores/context.store";
import {Api} from "../infr/api";

@Injectable()
export class InboxStore extends ContextStore{
    public static URI = 'inbox';
    constructor(locator: DomainLocator, api: Api) {
        super(InboxStore.URI, api, locator);
    }

    MoveToCurrent(id: string) {
        const message = this.locator.GetMessage(this.URI, id);
        message.Actions.Move(this.URI, CurrentStore.URI, 0);
    }
}