import {ResolvablePromise} from "@cmmn/core";
import {GossipSub} from "@chainsafe/libp2p-gossipsub";
import {BroadcastSyncMessage} from "./p2p.service";
import {Packr} from 'msgpackr/pack';

export class P2PRoom {
    private channel = new BroadcastChannel(this.uri);
    private dataTopic = `${this.uri}.data`;
    public peers = new Set<string>([this.myPeerId]);
    private replicaID = new ResolvablePromise<string>();

    private packr = new Packr({
        structuredClone: true,
    }) as Packr & {offset: number;};
    constructor(private uri: string,
                private pubsub: GossipSub,
                private myPeerId: string) {
        this.pubsub.addEventListener('gossipsub:message', e => {
            const peers = this.pubsub.getPeers();
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
            if (!message.targetID)
                this.channel.postMessage(message);
            if (message.targetID != this.myPeerId)
                return;
            this.channel.postMessage({
                ...message,
                targetID: await this.replicaID
            });
        })
        this.channel.addEventListener('message', async (e: MessageEvent<BroadcastSyncMessage>) => {
            if (this.replicaID.isResolved && (await this.replicaID) !== e.data.senderID) {
                throw new Error(`Not implemented: change doc`)
            }
            if (!this.replicaID.isResolved) {
                this.replicaID.resolve(e.data.senderID);
            }
            this.pubsub.publish(this.dataTopic, this.packr.encode(e.data));
        });
    }

    welcome(peer) {
        this.join(peer.toString());
    }

    join(senderID: string) {
        this.channel.postMessage({
            type: "getState",
            senderID: senderID,
        } as BroadcastSyncMessage);
    }
}