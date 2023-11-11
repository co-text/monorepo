import {StorageJSON} from "@cotext/sdk";
import {MessageStore} from "./messageStore";
import {ResourceTokenStore} from "@infr/yjs/resource-token-store";
import {bind, Injectable} from "@cmmn/core";
import {ResourceTokenApi} from "@infr/resource-token-api.service";
// @ts-ignore
import {WebRtcProvider} from "@cmmn/sync/webrtc/client";
import { ISyncProvider, LocalSyncProvider } from "@cmmn/sync";

@Injectable()
export class YjsRepository {

    private map = new Map<string, MessageStore>();
    //
    // public Provider = new WebRtcProvider(
    //     [`${location.origin.replace(/^http/, 'ws')}/api`],
    // );

    constructor(private tokenStore: ResourceTokenStore,
                private api: ResourceTokenApi) {
    }

    State$ = null;

    async Clear(): Promise<void> {
        MessageStore.clear()
    }

    LoadContext(uri: string, parentURI: string): MessageStore {
        return this.GetOrAdd(uri, parentURI);
    }

    GetOrAdd(uri: string, parentURI): MessageStore {
        return this.map.getOrAdd(uri, uri => {
            const store = new MessageStore(uri);
            console.log(uri, parentURI);
            this.getProviders(uri, parentURI).then(async providers => {
                console.log(providers);
                for (let provider of providers) {
                    provider.addAdapter(store.adapter);
                }
                await store.Init()
            });
            return store;
        });
    }

    async Load(uri: string = null): Promise<StorageJSON> {
        return new Promise<StorageJSON>(r => ({}));
    }

    @bind
    private createContextStore(uri){
    }

    // @cell
    // public Networks = new ObservableMap<string, Network>();

    private async getProviders(uri: string, parentURI: string): Promise<ISyncProvider[]>{
        // const user = await this.api.GetUserInfo();
        // const token = await this.api.GetToken(uri, parentURI);
        // const room = this.Provider.joinRoom(uri, {
        //     token: token,
        //     user: user?.id
        // });
// @ts-ignore
//         room.on('network', network => {
//             console.log(network);
//             this.Networks.set(uri, network);
//         })
        console.log(uri, parentURI);
        return [
            new LocalSyncProvider(uri),
        ];
    }

}
