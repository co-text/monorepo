import {ResolvablePromise} from "@cmmn/core";
import {GossipSub} from "@chainsafe/libp2p-gossipsub";
import {BroadcastSyncMessage} from "./p2p.service";
import {Packr} from 'msgpackr/pack';
import type {Connection, Stream} from "@libp2p/interface/connection";
import forEach from "it-foreach";
import {pipe} from "it-pipe";
import {Uint8ArrayList} from "uint8arraylist";

export class P2PRoom {
    private channel = new BroadcastChannel(this.uri+".out");
    private dataTopic = `${this.uri}.data`;
    public peers = new Set<string>([this.myPeerId]);
    private replicaID = new ResolvablePromise<string>();

    private packr = new Packr({
        structuredClone: true,
    }) as Packr & {offset: number;};
    constructor(private uri: string,
                private myPeerId: string) {
        // this.pubsub.addEventListener('gossipsub:message', e => {
        //     const peers = this.pubsub.getPeers();
        //     for (let peer of peers) {
        //         if (this.peers.has(peer.toString())) continue;
        //         this.peers.add(peer.toString());
        //         this.welcome(peer);
        //     }
        // });
        // this.pubsub.subscribe(this.dataTopic);
        // this.pubsub.addEventListener('message', async e => {
        //     if (e.detail.topic !== this.dataTopic) return;
        //     const message = this.packr.decode(e.detail.data) as BroadcastSyncMessage;
        //     if (!message.targetID)
        //         this.channel.postMessage(message);
        //     if (message.targetID != this.myPeerId)
        //         return;
        //     this.postToSyncStore({
        //         ...message,
        //         targetID: await this.replicaID
        //     });
        // })
        this.channel.addEventListener('message', async (e: MessageEvent<BroadcastSyncMessage>) => {
            if (!this.replicaID.isResolved) {
                this.replicaID.resolve(e.data.senderID);
            }
            // await this.pubsub.publish(this.dataTopic, this.packr.encode(e.data));
        }, {once: true});
        // this.postToSyncStore({
        //     data: undefined,
        //     type: 'getState',
        //     senderID: 'p2p',
        //     targetID: undefined
        // });
    }

    private async *channelGenerator(){
        while (true){
            const data = await new Promise<MessageEvent<BroadcastSyncMessage>>(resolve => this.channel.addEventListener('message', resolve, {once: true}));
            yield new Uint8ArrayList(this.packr.encode(data.data));
        }
    }
    public add(stream: Pick<Stream, "source"|"sink">){
        (async () => {
            for await (let data of stream.source){
                for (let datum of data) {
                    try {
                        const decode = this.packr.decode(datum);
                        console.log('get from webRTC', this.uri, decode);
                        this.postToSyncStore({
                            ...decode,
                            targetID: decode.targetID ? await this.replicaID : undefined
                        })
                    }catch (e){
                        console.log('error read from webRTC', this.uri, datum);
                    }
                }
            }
        })();

        pipe(this.channelGenerator(), stream.sink);


        this.postToSyncStore({
            data: undefined,
            type: 'getState',
            senderID: 'p2p',
            targetID: undefined
        });

        console.log(`sync with stream`);
    }
    postToSyncStore(message: BroadcastSyncMessage){
        this.channel.postMessage(message);
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

    stop() {

    }

    remove(stream: Stream) {
        // TODO: unsubsribee from stream
    }
}