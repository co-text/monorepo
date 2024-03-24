import { getOrAdd, Injectable, ResolvablePromise } from "@cmmn/core";
import { createLibp2p, Libp2p } from "libp2p";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import { all } from "@libp2p/websockets/filters";
import { multiaddr } from "@multiformats/multiaddr";
import { circuitRelayTransport } from "libp2p/circuit-relay";
import { noise } from "@chainsafe/libp2p-noise";
import { identifyService } from "libp2p/identify";
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub, GossipSub } from '@chainsafe/libp2p-gossipsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { P2PRoom } from "./p2p.room";
import type { Connection } from "@libp2p/interface/connection";
import { PeerId } from "@libp2p/interface/peer-id";

@Injectable()
export class P2PService {
    private node: Libp2p;
    private serverPeerId: string;
    private Init = new ResolvablePromise();
    private baseUrl = `/dns/${location.hostname}/tcp/${4005 || (location.protocol == 'https:' ? 443 : 80)}`;
    public isActive: boolean;

    constructor() {
    }

    async init(serverPeerId: string) {
        if (this.isActive) return;
        this.isActive = true;
        if (this.serverPeerId) {
            throw new Error(`Init P2P only once`)
        }
        this.serverPeerId = serverPeerId;
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
                webRTC({
                    rtcConfiguration: {
                        iceServers: [{
                            urls: [
                                'stun:stun1.l.google.com:19302',
                                'stun:stun2.l.google.com:19302',
                                'stun:stun3.l.google.com:19302',
                                'stun:stun4.l.google.com:19302',
                            ]
                        }]
                    }
                }),
                // support dialing/listening on Circuit Relay addresses
                circuitRelayTransport({
                    // make a reservation on any discovered relays - this will let other
                    // peers use the relay to contact us
                    discoverRelays: 1,
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
            connectionManager: {
                minConnections: 6,
                maxConnections: 9,
            },
            peerDiscovery: [
                pubsubPeerDiscovery()
            ],
            services: {
                identify: identifyService(),
                pubsub: gossipsub({
                    allowPublishToZeroPeers: true,
                })
            }
        });
        // console.log(`my id: `, this.node.peerId.toString());
        // const dialer = await createLibp2p({
        //     transports: [
        //         webRTCDirect(),
        //         webSockets()
        //     ]
        // });
        // await dialer.start();

        // this.node.addEventListener('connection:open', (e) => {
        // console.log('open', e.detail.id, e.detail.multiplexer);
        // this.addConnection(e.detail)
        // updatePeerList()
        // })
        // this.node.handle('/cotext/data/1.0.0', (e) => {
        //     this.addConnection(e.connection, e.stream)
        //     // updatePeerList()
        // });
        // this.node.addEventListener('connection:close', (e) => {
        //     this.removeConnection(e.detail);
        //     // updatePeerList()
        // });
        // this.node.addEventListener('self:peer:update', () => {
        //     const multiaddrs = this.node.getMultiaddrs()
        //     console.log(multiaddrs.map(x => x.toString()));
        // })
        this.node.addEventListener('peer:discovery', e => {
            this.connect(e.detail.id);
        });
        for (let peer of this.node.getPeers()) {
            this.connect(peer)
        }
        await this.connectToServer();
        this.Init.resolve();
    }

    private serverConnection: Connection;

    async connectToServer() {
        if (this.serverConnection) return;
        this.serverConnection = await this.node.dial(multiaddr(
            `${this.baseUrl}/${location.protocol == 'https:' ? 'wss' : 'ws'}/p2p/${this.serverPeerId}`,
        ));
    }

    async disconnectToServer() {
        if (!this.serverConnection) return;
        await this.serverConnection.close();
    }

    // @cell
    // public streams = new ObservableMap<string, P2pStream>();
    // private addConnection(connection: Connection, stream: Stream){
    //     console.log(connection.id, connection.multiplexer);
    //     const p2pStream = new P2pStream(stream, connection.id);
    //     this.streams.set(connection.id, p2pStream);
    //     for (let room of this.rooms.values()) {
    //         room.add(p2pStream)
    //     }
    // }
    // private removeConnection(connection: Connection){
    //     const stream = this.streams.get(connection.id);
    //     for (let room of this.rooms.values()) {
    //         room.remove(stream)
    //     }
    //     this.streams.delete(connection.id);
    // }
    private async connect(peer: PeerId) {
        const id = peer.toString();
        if (id == this.serverPeerId) return;
        if (id < this.node.peerId.toString()) {
            console.log(`wait for call from ${id}`);
            return;
        }
        console.log(`call to ${id}`);
        const connection = await this.node.dial(multiaddr(
            `${this.baseUrl}/p2p/${this.serverPeerId}/p2p-circuit/webrtc/p2p/${id}`
        ));
        // const p2pStream = new P2pStream(stream, stream.id);
        // for (let room of this.rooms.values()) {
        //     await room.add(p2pStream)
        // }
        // this.streams.set(stream.id, p2pStream);
    }

    get pubsub() {
        return this.node.services.pubsub as GossipSub;
    }

    private rooms = new Map<string, P2PRoom>();

    public async joinRoom(uri: string) {
        await this.Init;
        getOrAdd(this.rooms, uri, uri => {
            const room = new P2PRoom(uri, this.node.peerId.toString(), this.pubsub);
            // for (let stream of this.streams.values()) {
            //     room.add(stream);
            // }
            return room;
        });
    }

    public stop() {
        this.isActive = false;
        for (let room of this.rooms.values()) {
            room.stop();
        }
        return this.node.stop();
    }
}

export type BroadcastSyncMessage = {
    type: 'update' | 'state' | 'getState';
    targetID: string | undefined;
    senderID: string;
    data: Uint8Array;
}
