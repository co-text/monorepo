import { createLibp2p } from "libp2p";
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import {webRTC} from "@libp2p/webrtc";
import { webSockets } from '@libp2p/websockets'
import { WebRTC } from '@multiformats/mafmt'
import * as filter from '@libp2p/websockets/filters'
import { multiaddr } from '@multiformats/multiaddr'
import {circuitRelayServer, circuitRelayTransport} from 'libp2p/circuit-relay'
import {identifyService} from "libp2p/identify";
import {gossipsub} from "@chainsafe/libp2p-gossipsub";
import {pubsubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";

export const node = await createLibp2p({
    transports: [
        webSockets({
            filter: filter.all
        }),
        circuitRelayTransport(),
        // webRTC()
    ],
    addresses: {
        listen: [
            '/ip4/127.0.0.1/tcp/4005/ws',
            // '/webrtc',
            // '/ip4/0.0.0.0/udp/4005/p2p-circuit'
        ]
    },
    connectionEncryption: [
        noise()
    ],
    streamMuxers: [
        yamux()
    ],
    peerDiscovery: [
        pubsubPeerDiscovery()
    ],
    services: {
        pubsub: gossipsub({
            canRelayMessage: true,
            allowPublishToZeroPeers: true,
        }),
        identify: identifyService(),
        relay: circuitRelayServer({
            reservations: {
                maxReservations: 2
            }
        })
    }
})
await node.start()
node.addEventListener('peer:discovery', e => console.warn('+', e.detail.id.toString()));
node.addEventListener('peer:disconnect', e => {
    console.warn('-', e.detail.toString())
    node.services.relay.reservations.delete(e.detail);
});
console.log('multiaddrs:', node.getMultiaddrs());