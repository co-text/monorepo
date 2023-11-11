import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-main.template";
import style from "./app-main.style.less";
import {Injectable} from "@cmmn/core";

@Injectable(true)
@component({name: 'app-main', template, style})
export class AppMainComponent extends HtmlComponent<IState, IEvents> {

    @property()
    private property!: any;

    get State() {
        return this.property;
    }
}
