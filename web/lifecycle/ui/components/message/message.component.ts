import {component, HtmlComponent, property, event} from "@cmmn/ui";
import {template, IState, IEvents} from "./message.template";
import style from "./message.style.less";
import {Injectable} from "@cmmn/core";
import {ModelLike} from "@cmmn/domain/worker";
import type {IMessageActions, Message} from "@cotext/sdk";
import {Cell} from "@cmmn/cell";

@Injectable(true)
@component({name: 'app-message', template, style})
export class MessageComponent extends HtmlComponent<IState, IEvents> {

    constructor() {
        super();
    }
    created = new Date();
    disconnectPosition: DOMRect;
    disconnectedCallback() {
        this.disconnectPosition = this.element.getBoundingClientRect();
        super.disconnectedCallback();
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.disconnectPosition) {
            this.once('render', () => {
                const connectPosition = this.element.getBoundingClientRect();
                console.log(connectPosition, this.disconnectPosition);
                const diff = {
                    x: connectPosition.x - this.disconnectPosition.x,
                    y: connectPosition.y - this.disconnectPosition.y,
                };
                // c
                // this.element.style.transform = `translate(${-diff.x}px, ${-diff.y}px)`;
            });
        }
    }

    @event('input', {passive: true, selector: 'input'})
    onChange(e: InputEvent){
        const target = e.currentTarget as HTMLInputElement;
        this.message.State = {
            ...this.message.State,
            Content: target.value
        };
    }

    @property()
    private message!: ModelLike<Message, IMessageActions>;

    get State() {
        return {
            message: this.message.State
        };
    }
}
