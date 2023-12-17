import {test, suite, timeout} from "@cmmn/tools/test";
import {node} from "../p2p/index";
import {createLibp2p} from "libp2p";
import {noise} from "@chainsafe/libp2p-noise";
import {yamux} from "@chainsafe/libp2p-yamux";
import {tcp} from "@libp2p/tcp";
@suite
export class P2PSpec {

    async getNewNode(){
        const newNode = await createLibp2p({
            transports: [
                tcp()
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
                minConnections: 0
            }
        });
        await newNode.dial(node.getMultiaddrs());
        await new Promise<void>(resolve => {
            console.log(newNode.getMultiaddrs());
            if (newNode.getMultiaddrs().length)
                return resolve();
            newNode.addEventListener('self:peer:update', e => {
                console.log(newNode.getMultiaddrs());
                if (newNode.getMultiaddrs().length)
                    resolve();
            })
        });
        return newNode;
    }

    @test
    @timeout(2 ** 30)
    async testNodeMaxCount(){
        let count = 0;
        try {
            while (true) {
                await this.getNewNode();
                count++;
                console.log(count);
            }
        }catch (e){
            console.log(count, e);
        }
    }
}