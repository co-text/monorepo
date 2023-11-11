import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-inbox.template";
import style from "./app-inbox.style.less";
import {Injectable, utc} from "@cmmn/core";
import {DomainLocator, IMessageActions, Message} from "@cotext/sdk";
import {ModelLike} from "@cmmn/domain/worker";

@Injectable(true)
@component({name: 'app-inbox', template, style})
export class AppInboxComponent extends HtmlComponent<IState, IEvents> {

    constructor(private locator: DomainLocator) {
        super();
    }

    private inbox = this.locator.GetOrCreateContext("inbox", undefined);

    @property()
    private property!: any;

    get State() {
        return {
            messages: Array.from(this.inbox.Messages.values()) as Array<ModelLike<Message, IMessageActions>>
        }
    }

    add(){
        this.inbox.CreateMessage({
            Content: '',
            CreatedAt: utc(),
            UpdatedAt: utc(),
        } as Message)
    }
}
