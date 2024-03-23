import { createLibp2p } from "libp2p";
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webSockets } from '@libp2p/websockets'
import * as filter from '@libp2p/websockets/filters'
import { circuitRelayServer, circuitRelayTransport } from 'libp2p/circuit-relay'
import { identifyService } from "libp2p/identify";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import * as process from "process";

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
        ],
        announce: [
            process.env.PUBLIC_MULTIADDR
        ]
    },
    connectionManager: {
        minConnections: 0,
    },
    connectionEncryption: [
        noise()
    ],
    streamMuxers: [
        yamux()
    ],
    peerDiscovery: [
        pubsubPeerDiscovery({
            listenOnly: true
        })
    ],
    services: {
        pubsub: gossipsub({
            canRelayMessage: true,
            allowPublishToZeroPeers: true,

            scoreThresholds: {
                gossipThreshold: Number.NEGATIVE_INFINITY,
                publishThreshold: Number.NEGATIVE_INFINITY
            },
            scoreParams: {}

        }),
        identify: identifyService(),
        relay: circuitRelayServer({
            // reservations: {
            //     maxReservations: 2
            // }
        }),
    }
})
await node.start()
node.addEventListener('peer:discovery', e => {
    console.warn('+', e.detail.id.toString());
    console.log(node.services.relay.reservations.size)
});
node.addEventListener('peer:disconnect', e => {
    console.warn('-', e.detail.toString())
    node.services.relay.reservations.delete(e.detail);
    console.log(node.services.relay.reservations.size)
});
console.log('multiaddrs:', node.getMultiaddrs());