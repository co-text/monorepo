import { component, HtmlComponent, property } from "@cmmn/ui";
import { IEvents, IState, template } from "./app-high.template";
import style from "./app-high.style.less";
import { Injectable } from "@cmmn/core";

@Injectable(true)
@component({name: 'app-high', template, style})
export class AppHighComponent extends HtmlComponent<IState, IEvents> {

    @property()
    private property!: any;

    get State() {
        return this.property;
    }
}
