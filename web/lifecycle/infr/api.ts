import {UserStore} from "@stores/user.store";
import {Fn, Injectable} from "@cmmn/core";
import {P2PService} from "./p2p.service";

@Injectable()
export class Api {
    constructor(private userStore: UserStore,
                private p2p: P2PService) {
    }

    // private provider = new WebRtcProvider(
    //     [`ws://${this.origin}/api`]
    // );

    getPeerId(){
        return fetch(`/api/peer`).then(x => x.text());
    }
    @Fn.cache()
    async initP2P(){
        const peerId = await this.getPeerId();
        await this.p2p.init(peerId);
    }

    public async joinRoom(uri: string){
        await this.initP2P();
        await this.p2p.joinRoom(uri);
        // const request = await fetch(`http://${this.origin}/api/context?uri=${uri}`, {
        //     headers: {
        //         'authorization': JSON.stringify({user: this.userStore.user.get()}),
        //     }
        // });
        // const token = request.headers.get('resource-token');
        // this.provider.joinRoom(uri, {token, user: this.userStore.user.get()})
    }


}