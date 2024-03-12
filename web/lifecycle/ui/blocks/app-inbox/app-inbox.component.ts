import {component, HtmlComponent, event, select} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-inbox.template";
import style from "./app-inbox.style.less";
import {Injectable} from "@cmmn/core";
import {Router} from "@cmmn/app";
import {InboxStore} from "@stores/inbox.store";

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
