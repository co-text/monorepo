import {component, HtmlComponent, property, event} from "@cmmn/ui";
import {template, IState, IEvents} from "./message.template";
import style from "./message.style.less";
import {Injectable} from "@cmmn/core";
import {ModelLike} from "@cmmn/domain/worker";
import {IMessageActions, Message} from "@cotext/sdk";

@Injectable(true)
@component({name: 'app-message', template, style})
export class MessageComponent extends HtmlComponent<IState, IEvents> {

    constructor() {
        super();
    }

    @event('input', {passive: true, selector: 'input'})
    onChange(e: InputEvent){
        const target = e.currentTarget as HTMLInputElement;
        this.message.Actions.UpdateText(target.value);
    }

    @property()
    private message!: ModelLike<Message, IMessageActions>;

    get State() {
        return {
            message: this.message.State
        };
    }
}
