import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-result.template";
import style from "./app-result.style.less";
import {Injectable} from "@cmmn/core";

@Injectable(true)
@component({name: 'app-result', template, style})
export class AppResultComponent extends HtmlComponent<IState, IEvents> {

    @property()
    private property!: any;

    get State() {
        return this.property;
    }
}
