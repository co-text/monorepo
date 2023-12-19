import {suite, test, expect, sinon} from "@cmmn/tools/test"
import {P2PRoom} from "@infr/p2p.room";
import {Stream} from "@libp2p/interface/connection";
import {EventEmitter, Fn} from "@cmmn/core";
@suite
export class P2pRoomSpec{
    private bc1 = new BroadcastChannel("1");
    private bc2 = new BroadcastChannel("2");

    private room1 = new P2PRoom("1", "0");
    private room2 = new P2PRoom("2", "0");

    @test
    async testStream(){
        const emitter = new EventEmitter();
        async function *gen(){
            console.log('listen emiiter');
            while (true) {
                const data = await emitter.onceAsync('data')
                console.log('stream get');
                yield data;
            }
        }
        function stream(): Pick<Stream, "source"|"sink"> {
            return {
                source: gen(),
                sink: async source => {
                    console.log('push to stream');
                    emitter.emit('data', source)
                }
            }
        };
        const listener = sinon.spy();
        this.bc2.addEventListener('message', listener);
        this.room1.add(stream());
        this.room2.add(stream());
        await Fn.asyncDelay(10);
        expect(listener.callCount).toEqual(1);
        this.bc1.postMessage({})
        await Fn.asyncDelay(30);
        expect(listener.callCount).toEqual(2);
    }
}