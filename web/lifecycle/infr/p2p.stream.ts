import type {Stream} from "@libp2p/interface/connection";
import {Packr} from 'msgpackr/pack';
import {BroadcastSyncMessage} from "@infr/p2p.service";
import {Uint8ArrayList} from "uint8arraylist";
import {EventEmitter, ResolvablePromise} from "@cmmn/core";
import {pipe} from "it-pipe";

export class P2pStream extends EventEmitter<Record<string, BroadcastSyncMessage>>{
    private packr = new Packr({
        structuredClone: true,
    }) as Packr & {offset: number;};

    constructor(readonly stream: Pick<Stream, "source"|"sink">,
                public readonly id: string) {
        super();
        this.read();
        pipe(this.channelGenerator(), stream.sink);
    }

    private writePromise = new ResolvablePromise<StreamMessage>();
    private async *channelGenerator(){
        while (true){
            const data = await this.writePromise;
            this.writePromise = new ResolvablePromise();
            yield new Uint8ArrayList(this.packr.encode(data));
        }
    }

    async read(){
        for await (let data of this.stream.source){
            for (let datum of data) {
                try {
                    const decode = this.packr.decode(datum) as StreamMessage;
                    this.emit(decode.docID, decode.message);
                } catch (e) {
                    console.log('error read from webRTC', datum);
                }
            }
        }
    }

    async write(message: StreamMessage){
        this.writePromise.resolve(message);
    }
}

export type StreamMessage = {
    docID: string;
    message: BroadcastSyncMessage;
}