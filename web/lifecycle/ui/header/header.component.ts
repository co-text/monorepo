import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./header.template";
import style from "./header.style.less";
import {Injectable} from "@cmmn/core";
import {UserStore} from "@stores/user.store";

@Injectable(true)
@component({name: 'app-header', template, style})
export class HeaderComponent extends HtmlComponent<IState, IEvents> {

    constructor(private userStore: UserStore) {
        super();
    }
    @property()
    private property!: any;

    get State() {
        return {
            user: this.userStore.user.get()
        }
    }
}
