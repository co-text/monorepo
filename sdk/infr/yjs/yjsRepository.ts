import {StorageJSON} from "@cotext/sdk";
import {MessageStore} from "./messageStore";
import {ResourceTokenStore} from "@infr/yjs/resource-token-store";
import {bind, getOrAdd, Injectable} from "@cmmn/core";
import {ResourceTokenApi} from "@infr/resource-token-api.service";
// @ts-ignore
import {WebRtcProvider} from "@cmmn/sync/webrtc/client";

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
        return getOrAdd(this.map, uri, uri => {
            const store = new MessageStore(uri);
            console.log(uri, parentURI);
            store.Init()
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


}
