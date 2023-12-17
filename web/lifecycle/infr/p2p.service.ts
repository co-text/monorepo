import {deserialize, Injectable, ResolvablePromise, serialize} from "@cmmn/core";
import {createLibp2p, Libp2p} from "libp2p";
import {webRTC, webRTCDirect} from "@libp2p/webrtc";
import {webSockets} from "@libp2p/websockets";
import {all} from "@libp2p/websockets/filters";
import {multiaddr} from "@multiformats/multiaddr";
import {circuitRelayServer, circuitRelayTransport} from "libp2p/circuit-relay";
import {noise} from "@chainsafe/libp2p-noise";
import {identifyService} from "libp2p/identify";
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub, GossipSub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import {DocAdapter} from "@cmmn/sync";
import {container} from "../container";
@Injectable()
export class P2PService {
    private node: Libp2p;
    public Init = this.init();
    constructor(private serverPeerId: string) {
    }

    async init(){
        const pubsub = gossipsub({
            allowPublishToZeroPeers: true,
        });
        this.node = globalThis['node'] = await createLibp2p({
            addresses: {
                listen: [
                    // create listeners for incoming WebRTC connection attempts on on all
                    // available Circuit Relay connections
                    '/webrtc'
                ]
            },
            transports: [
                // the WebSocket transport lets us dial a local relay
                webSockets({
                    // this allows non-secure WebSocket connections for purposes of the demo
                    filter: all
                }),
                // support dialing/listening on WebRTC addresses
                webRTC(),
                // support dialing/listening on Circuit Relay addresses
                circuitRelayTransport({
                    // make a reservation on any discovered relays - this will let other
                    // peers use the relay to contact us
                    discoverRelays: 1
                })
            ],
            // a connection encrypter is necessary to dial the relay
            connectionEncryption: [noise()],
            // a stream muxer is necessary to dial the relay
            streamMuxers: [yamux()],
            connectionGater: {
                denyDialMultiaddr: async () => {
                    // by default we refuse to dial local addresses from the browser since they
                    // are usually sent by remote peers broadcasting undialable multiaddrs but
                    // here we are explicitly connecting to a local node so do not deny dialing
                    // any discovered address
                    return false
                }
            },
            peerDiscovery: [
                pubsubPeerDiscovery()
            ],
            services: {
                identify: identifyService(),
                pubsub
            },
            connectionManager: {
                minConnections: 0
            }
        });
        // const dialer = await createLibp2p({
        //     transports: [
        //         webRTCDirect(),
        //         webSockets()
        //     ]
        // });
        // await dialer.start();
        await this.node.dial(multiaddr(
            `/ip4/127.0.0.1/tcp/4005/ws/p2p/${this.serverPeerId}`,
            // `/ip4/127.0.0.1/tcp/4005/p2p-circuit/webrtc/p2p/${dialer.peerId}`
        ));
        this.node.addEventListener('connection:open', (e) => {
            // console.log('open', e.detail);
            // updatePeerList()
        })
        this.node.handle('/cotext/data/1.0.0', (e) => {
            console.log('stream', e.stream);
            // updatePeerList()
        })
        this.node.addEventListener('connection:close', () => {
            console.log('close');
            // updatePeerList()
        });
        await new Promise<void>(resolve => {
            this.node.addEventListener('self:peer:update', () => {
                const multiaddrs = this.node.getMultiaddrs();
                if (multiaddrs.length > 0)
                    resolve();
            })
        });
        this.node.addEventListener('peer:discovery', e => {
            this.connect(e.detail.id)
        });
        for (let peer of this.node.getPeers()) {
            this.connect(peer)
        }
    }
    private async connect(peer){
        return;
        const id = peer.toString();
        if (id == this.serverPeerId) return;
        if (id < this.node.peerId.toString()) return;
        console.log(`call to ${id}`);
        const stream = await this.node.dialProtocol(multiaddr(
            `/ip4/127.0.0.1/tcp/4005/ws/p2p/${this.serverPeerId}/p2p-circuit/webrtc/p2p/${id}`
        ), [
            '/cotext/data/1.0.0'
        ]);
    }

    get pubsub(){
        return this.node.services.pubsub as GossipSub;
    }

    private rooms = new Map<string, P2PRoom>();

    public async joinRoom(uri: string){
        await this.Init;
        this.rooms.getOrAdd(uri, uri => new P2PRoom(uri, this.pubsub, this.node.peerId.toString()));
    }

    async dispose() {
        await this.node.stop();
    }
}

export class P2PRoom{
    private channel = new BroadcastChannel(this.uri);
    private dataTopic = `${this.uri}.data`;
    public peers = new Set<string>([this.myPeerId]);
    private replicaID = new ResolvablePromise<string>();
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
            const message = deserialize(e.detail.data) as BroadcastSyncMessage;
            if (!message.targetID)
                this.channel.postMessage(message);
            if (message.targetID != this.myPeerId)
                return;
            this.channel.postMessage({
                ...message,
                targetID: await this.replicaID
            });
            console.log('state applied', await this.replicaID);
        })
        this.channel.addEventListener('message', async (e: MessageEvent<BroadcastSyncMessage>) => {
            if (this.replicaID.isResolved && (await this.replicaID) !== e.data.senderID){
                throw new Error(`Not implemented: change doc`)
            }
            if (!this.replicaID.isResolved) {
                this.replicaID.resolve(e.data.senderID);
            }
            this.pubsub.publish(this.dataTopic, serialize(e.data));
        });
    }

    welcome(peer){
        this.join(peer.toString());
    }

    join(senderID: string){
        console.log('join', senderID);
        this.channel.postMessage({
            type: "getState",
            senderID: senderID,
        } as BroadcastSyncMessage);
    }
}

export type BroadcastSyncMessage = {
    type: 'update'|'state'|'getState';
    targetID: string | undefined;
    senderID: string;
    data: Uint8Array;
}