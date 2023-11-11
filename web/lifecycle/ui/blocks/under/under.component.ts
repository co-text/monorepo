import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./under.template";
import style from "./under.style.less";
import {Injectable} from "@cmmn/core";

@Injectable(true)
@component({name: 'app-under', template, style})
export class UnderComponent extends HtmlComponent<IState, IEvents> {

    @property()
    private property!: any;

    get State() {
        return this.property;
    }
}
