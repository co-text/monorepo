import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./app-root.template";
import style from "./app-root.style.less";
import {Fn, Injectable} from "@cmmn/core";
import {UserStore} from "@stores/user.store";
import { Router } from '@cmmn/app'
import { ContextClient, IContextProxy } from '@cotext/sdk/client'
import { Cell } from '@cmmn/cell'
import { Api } from '@infr/api'

@Injectable(true)
@component({name: 'app-root', template, style})
export class AppRootComponent extends HtmlComponent<IState, IEvents> implements IEvents {

    constructor(
      private router: Router,
      private userStore: UserStore,
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
        // Cell.OnChange(() => this.domainProxy.State.Contexts, async e => {
        //     for (let id of e.value) {
        //         await this.api.joinRoom(id);
        //     }
        // });
    }

    get State() {
        return {
            uri: this.getURI(this.router.Route.params.id)
        };
    }

    private getURI(id: string){
        return `${location.origin}/c/${id}`
    }

    async setUser(user: string){
        this.userStore.user.set(user);
        const uri = this.getURI(user);
        const context = ContextClient.get(uri);
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
            ContextURI: this.getURI('root'),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });
        context.CreateMessage({
            Content: 'Private',
            id: 'private',
            ContextURI: this.getURI('root'),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });
        context.CreateMessage({
            Content: 'Public',
            id: 'public',
            ContextURI: this.getURI('root'),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });
    }
}
