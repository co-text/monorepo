import {UserStore} from "@stores/user.store";
import {Injectable} from "@cmmn/core";
import {P2PService} from "./p2p.service";

@Injectable()
export class Api {

    constructor(private userStore: UserStore,
                public p2p: P2PService) {
    }

    private origin = 'localhost:4004';
    // private provider = new WebRtcProvider(
    //     [`ws://${this.origin}/api`]
    // );

    public async joinRoom(uri: string){
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