import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-layout.template";
import style from "./app-layout.style.less";
import {Injectable} from "@cmmn/core";

@Injectable(true)
@component({name: 'app-layout', template, style})
export class AppLayoutComponent extends HtmlComponent<IState, IEvents> {

    get State() {
        return {
            children: this.Children
        }
    }
}
