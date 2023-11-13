import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-main.template";
import style from "./app-main.style.less";
import {Injectable} from "@cmmn/core";
import {CurrentStore} from "@stores/current.store";

@Injectable(true)
@component({name: 'app-main', template, style})
export class AppMainComponent extends HtmlComponent<IState, IEvents> {

    constructor(private current: CurrentStore) {
        super();
    }

    get State() {
        return {
            messages: this.current.Messages
        }
    }
}
