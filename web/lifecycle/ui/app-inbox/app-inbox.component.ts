import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-inbox.template";
import style from "./app-inbox.style.less";
import {Injectable} from "@cmmn/core";

@Injectable(true)
@component({name: 'app-inbox', template, style})
export class AppInboxComponent extends HtmlComponent<IState, IEvents> {

    @property()
    private property!: any;

    get State() {
        return this.property;
    }
}
