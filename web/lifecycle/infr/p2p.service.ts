import {Injectable, serialize} from "@cmmn/core";
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
@Injectable()
export class P2PService {
    private node: Libp2p;
    public Init = this.init();
    private serverPeerId = '12D3KooWATwHirVDJopnYsfX9tHJwyiVgCHZZ2QtyPcJmAG9cwZY';
    constructor() {
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
            console.log('open', e.detail);
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
        this.node.addEventListener('self:peer:update', () => {
            const multiaddrs = this.node.getMultiaddrs()
            console.log(multiaddrs.map(x => x.toString()));
        })
        this.node.addEventListener('peer:discovery', e => {
            this.connect(e.detail.id)
        });
        for (let peer of this.node.getPeers()) {
            this.connect(peer)
        }
    }
    private async connect(peer){
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
        const room = new P2PRoom(uri, this.pubsub);
        this.rooms.set(uri, room);
    }

}

export class P2PRoom{
    private docAdapter = new DocAdapter(this.uri);
    private dataTopic = `${this.uri}.data`;
    constructor(private uri, private pubsub: GossipSub) {

        this.pubsub.subscribe(this.dataTopic);
        this.pubsub.addEventListener('message', e => {
            if (e.detail.topic !== this.dataTopic) return;
            this.docAdapter.send(e.detail.data);
        })
        this.docAdapter.on('message', m => {
            console.log(uri, m)
            this.pubsub.publish(this.dataTopic, m);
        });
    }


    join(senderID: string){
        this.docAdapter.send(serialize({
            type: "join",
            senderID: senderID,
            docID: this.uri
        }))
    }
}

