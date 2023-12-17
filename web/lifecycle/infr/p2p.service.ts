import {getOrAdd, Injectable, ResolvablePromise} from "@cmmn/core";
import {createLibp2p, Libp2p} from "libp2p";
import {webRTC} from "@libp2p/webrtc";
import {webSockets} from "@libp2p/websockets";
import {all} from "@libp2p/websockets/filters";
import {multiaddr} from "@multiformats/multiaddr";
import {circuitRelayTransport} from "libp2p/circuit-relay";
import {noise} from "@chainsafe/libp2p-noise";
import {identifyService} from "libp2p/identify";
import {yamux} from '@chainsafe/libp2p-yamux'
import {gossipsub, GossipSub} from '@chainsafe/libp2p-gossipsub'
import {pubsubPeerDiscovery} from '@libp2p/pubsub-peer-discovery'
import {P2PRoom} from "./p2p.room";
import type {Connection} from "@libp2p/interface/connection";
import {cell, ObservableMap} from "@cmmn/cell";
import { PeerId } from "@libp2p/interface/peer-id";

@Injectable()
export class P2PService {
    private node: Libp2p;
    private serverPeerId: string;
    private Init = new ResolvablePromise();
    constructor() {
    }

    async init(serverPeerId: string){
        if (this.serverPeerId) {
            throw new Error(`Init P2P only once`)
        }
        this.serverPeerId = serverPeerId;
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
        // console.log(`my id: `, this.node.peerId.toString());
        // const dialer = await createLibp2p({
        //     transports: [
        //         webRTCDirect(),
        //         webSockets()
        //     ]
        // });
        // await dialer.start();
        await this.node.dial(multiaddr(
            `/dns/${location.hostname}/tcp/${location.port}/ws/p2p/${this.serverPeerId}`,
            // `/ip4/127.0.0.1/tcp/4005/p2p-circuit/webrtc/p2p/${dialer.peerId}`
        ));
        this.node.addEventListener('connection:open', (e) => {
            console.log('open', e.detail.id, e.detail.multiplexer);
            this.addConnection(e.detail)
            // updatePeerList()
        })
        // this.node.handle('/cotext/data/1.0.0', (e) => {
        //     this.addConnection(e.connection)
        //     // updatePeerList()
        // });
        this.node.addEventListener('connection:close', (e) => {
            this.removeConnection(e.detail);
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
        this.Init.resolve();
    }

    @cell
    public streams = new ObservableMap<string, Connection>();
    private addConnection(connection: Connection){
        console.log(connection.id, connection.multiplexer);
        this.streams.set(connection.id, connection);
    }
    private removeConnection(connection: Connection){
        this.streams.delete(connection.id);
    }
    private async connect(peer: PeerId){
        const id = peer.toString();
        if (id == this.serverPeerId) return;
        if (id < this.node.peerId.toString()) return;
        console.log(`call to ${id}`);
        const stream = await this.node.dialProtocol(multiaddr(
            `/dns/${location.hostname}/tcp/${location.port}/ws/p2p/${this.serverPeerId}/p2p-circuit/webrtc/p2p/${id}`
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
        getOrAdd(this.rooms, uri, uri => new P2PRoom(uri, this.pubsub, this.node.peerId.toString()));
    }

    public dispose(){
        return this.node.stop();
    }
}

export type BroadcastSyncMessage = {
    type: 'update'|'state'|'getState';
    targetID: string | undefined;
    senderID: string;
    data: Uint8Array;
}
