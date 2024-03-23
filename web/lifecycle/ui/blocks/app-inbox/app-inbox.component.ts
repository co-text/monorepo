import { component, HtmlComponent } from "@cmmn/ui";
import { IEvents, IState, template } from "./app-inbox.template";
import style from "./app-inbox.style.less";
import { Injectable } from "@cmmn/core";
import { Router } from "@cmmn/app";

@Injectable(true)
@component({name: 'app-inbox', template, style})
export class AppInboxComponent extends HtmlComponent<IState, IEvents> {

    constructor(private router: Router) {
        super();
    }

    get State() {
        return {
            uri: this.router.Path
        }
    }

}
