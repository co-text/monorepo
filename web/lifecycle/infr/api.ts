import {UserStore} from "@stores/user.store";
import {Fn, Injectable} from "@cmmn/core";
import {P2PService} from "./p2p.service";
import {ClientStore} from "@infr/client.store";

@Injectable()
export class Api {
    private clientStore = new ClientStore();
    constructor(private userStore: UserStore,
                private p2p: P2PService) {
        globalThis['api'] = this;
        this.clientStore.on('change', async e => {
            if (e.isMain){
                await this.p2p.init(await this.getPeerId());
            } else {
                await this.p2p.stop();
            }
        })
    }
    getPeerId(){
        return fetch(`/api/peer`).then(x => x.text());
    }

    public async joinRoom(uri: string){
        if (!this.p2p.isActive && this.clientStore.isMain){
            await this.p2p.init(await this.getPeerId());
        }
        await this.p2p.joinRoom(uri);
    }


}