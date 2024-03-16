import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-root.template";
import style from "./app-root.style.less";
import {Fn, Injectable} from "@cmmn/core";
import {UserStore} from "@stores/user.store";
import { Router } from '@cmmn/app'
import { DomainProxy, IContextProxy } from '@proxy'
import { Cell } from '@cmmn/cell'
import { Api } from '@infr/api'

@Injectable(true)
@component({name: 'app-root', template, style})
export class AppRootComponent extends HtmlComponent<IState, IEvents> implements IEvents {

    constructor(
      private router: Router,
      private userStore: UserStore,
      private domainProxy: DomainProxy,
      private api: Api
    ) {
        super();
        if (!this.router.Route?.params.id && this.userStore.user.get()){
            this.router.Route = {
                name: 'main',
                params: {id: this.userStore.user.get()}
            }
        }
        if (!sessionStorage.getItem('session')) {
            sessionStorage.setItem('session', Fn.ulid());
        }
        domainProxy.Actions.SetSession(sessionStorage.getItem('session'));
        Cell.OnChange(() => this.domainProxy.State.Contexts, async e => {
            for (let id of e.value) {
                await this.api.joinRoom(id);
            }
        });
    }

    get State() {
        return {
            user: this.userStore.user.get(),
            uri: this.getURI(this.router.Route.params.id)
        };
    }

    private getURI(id: string){
        return `${location.origin}/c/${id}`
    }

    async setUser(user: string){
        this.userStore.user.set(user);
        const uri = this.getURI(user);
        const context = this.domainProxy.getContext(uri);
        await this.initContext(context);
        this.router.Route = {
            name: 'main',
            params: {
                id: user
            }
        }
    }

    private async initContext(context: IContextProxy){
        if (!context.State)
            await new Cell(() => context.State).onceAsync('change');
        if (context.State.Messages.length > 0)
            return;
        console.log(context.State);
        context.CreateMessage({
            Content: 'Inbox',
            id: 'inbox',
            URI: this.getURI('inbox'),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });
        context.CreateMessage({
            Content: 'Private',
            id: 'private',
            URI: this.getURI('private'),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });
        context.CreateMessage({
            Content: 'Public',
            id: 'public',
            URI: this.getURI('public'),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });
    }
}
