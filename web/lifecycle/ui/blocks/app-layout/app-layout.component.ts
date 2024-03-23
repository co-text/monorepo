import { component, HtmlComponent } from "@cmmn/ui";
import { IEvents, IState, template } from "./app-layout.template";
import style from "./app-layout.style.less";
import { Injectable } from "@cmmn/core";

@Injectable(true)
@component({name: 'app-layout', template, style})
export class AppLayoutComponent extends HtmlComponent<IState, IEvents> {

    get State() {
        return {
            children: this.Children
        }
    }
}
