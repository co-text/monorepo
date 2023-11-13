import {component, HtmlComponent, event} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-inbox.template";
import style from "./app-inbox.style.less";
import {Injectable} from "@cmmn/core";
import {InboxStore} from "@stores/inbox.store";

@Injectable(true)
@component({name: 'app-inbox', template, style})
export class AppInboxComponent extends HtmlComponent<IState, IEvents> {

    constructor(private inbox: InboxStore) {
        super();
    }

    get State() {
        return {
            messages: this.inbox.Messages
        }
    }

    add(){
        this.inbox.CreateMessage()
    }
    take(id: string){
        this.inbox.MoveToCurrent(id);
    }

    @event('keypress')
    onInput(e: KeyboardEvent){
        if (!e.altKey) return;
        console.log(e.key);
        if (e.key == 'ArrowRight'){

        }
    }
}
