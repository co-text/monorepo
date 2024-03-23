import { expect, suite, test } from "@cmmn/tools/test";
import { createLibp2p } from "libp2p";
import { pipe } from "it-pipe";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { Uint8ArrayList } from "uint8arraylist";

@suite
export class P2PSpec {

    @test
    async getNewNode() {
        const server = await createLibp2p({
            transports: [
                tcp()
            ],
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            addresses: {
                listen: ['/ip4/127.0.0.1/tcp/4321']
            }
        });
        const client = await createLibp2p({
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            transports: [
                tcp()
            ],
        });

        const serverAddress = server.getMultiaddrs();
        const promise = new Promise<Uint8ArrayList>(resolve => server.handle('/test/data/1.0.0', async e => {
            for await (let data of e.stream.source) {
                resolve(data);
            }
        }))
        const stream = await client.dialProtocol(serverAddress, '/test/data/1.0.0');
        const raw = [1, 2, 3, 4, 5];
        await pipe([new Uint8Array(raw)], stream);
        const data = await promise;
        expect([...[...data][0].values()]).toEqual(raw);
    }

}