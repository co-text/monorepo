import { ResolvablePromise } from "@cmmn/core";
import { BroadcastSyncMessage } from "./p2p.service";
import { GossipSub } from "@chainsafe/libp2p-gossipsub";
import { Packr } from 'msgpackr/pack';

export class P2PRoom {
    private channel = new BroadcastChannel(this.uri + ".out");
    private dataTopic = `cotext:${this.uri}.data`;
    public peers = new Set<string>([this.myPeerId]);
    private replicaID = new ResolvablePromise<string>();
    private packr = new Packr({
        structuredClone: true,
    }) as Packr & { offset: number; };

    constructor(private uri: string,
                private myPeerId: string,
                private pubsub: GossipSub) {
        this.pubsub.addEventListener('gossipsub:message', e => {
            const peers = this.pubsub.getSubscribers(this.dataTopic);
            for (let peer of peers) {
                if (this.peers.has(peer.toString())) continue;
                this.peers.add(peer.toString());
                this.welcome(peer);
            }
        });
        this.pubsub.subscribe(this.dataTopic);
        this.pubsub.addEventListener('message', async e => {
            if (e.detail.topic !== this.dataTopic) return;
            const message = this.packr.decode(e.detail.data) as BroadcastSyncMessage;
            // console.log(`get ${message.type} from ${message.senderID}`);
            if (!message.targetID)
                this.channel.postMessage(message);
            if (message.targetID == this.myPeerId)
                message.targetID = await this.replicaID
            else if (message.targetID != await this.replicaID)
                return;
            this.channel.postMessage(message);
        })
        this.channel.addEventListener('message', async (e: MessageEvent<BroadcastSyncMessage>) => {
            if (e.data.targetID === 'p2p') {
                this.replicaID.resolve(e.data.senderID);
            } else {
                await this.sendToOthers(e.data);
            }
        });
        this.channel.postMessage({
            type: 'getState',
            senderID: 'p2p'
        } as BroadcastSyncMessage);
    }

    async welcome(peer) {
        await this.sendToOthers({
            type: 'getState',
            targetID: peer.toString(),
            senderID: await this.replicaID,
            data: null
        });
    }

    sendToOthers(data: BroadcastSyncMessage) {
        // console.log(`publish ${data.type} to ${data.targetID ?? 'everybody'}`);
        return this.pubsub.publish(this.dataTopic, this.packr.encode(data))
    }

    stop() {

    }

}