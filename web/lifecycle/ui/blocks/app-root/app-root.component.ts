import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-root.template";
import style from "./app-root.style.less";
import {Injectable} from "@cmmn/core";
import {UserStore} from "@stores/user.store";

@Injectable(true)
@component({name: 'app-root', template, style})
export class AppRootComponent extends HtmlComponent<IState, IEvents> {

    constructor(private userStore: UserStore) {
        super();
    }

    setUser(user: string){
        this.userStore.user.set(user);
    }

    get State() {
        return {
            user: this.userStore.user.get()
        };
    }
}
