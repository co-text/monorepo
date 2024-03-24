import { ISyncStore } from "./base/istore";

export class BroadcastSync {
    private channel = new BroadcastChannel(this.name);
    constructor(private name: string,
                private logger: typeof console.log | undefined = undefined) {
    }

    /** @internal **/
    public async listen(store: ISyncStore){
        await store.init;
        store.on('patch', data => {
            this.channel.postMessage({
                type: "update",
                senderID: store.id,
                data: data,
                clock: store.clock
            })
            this.logger?.('send', "update", store.id);
        })
        this.channel.postMessage({
            type: "getState",
            senderID: store.id,
            clock: store.clock,
            data: store.getState()
        });
        this.logger?.(store.clock);
        this.channel.addEventListener(
            'message',
            (e: MessageEvent<BroadcastSyncMessage>) => this.onMessage(store, e.data)
        );
    }

    private onMessage(store: ISyncStore, data: BroadcastSyncMessage){
        switch (data.type){
            case "getState":
                this.channel.postMessage({
                    type: 'state',
                    targetID: data.senderID,
                    senderID: store.id,
                    clock: store.clock,
                    data: store.getState()
                });
                data.data && store.load(data.data);
                this.logger?.('get state from', data.senderID, data.clock);
                return;
            case "state":
                if (data.targetID && data.targetID !== store.id)
                    return;
                store.load(data.data);
                this.logger?.('get state from', data.senderID, data.clock);
                return;
            case "update":
                if (data.targetID && data.targetID !== store.id)
                    return;
                store.applyPatch(data.data, data.clock);
                this.logger?.('get update from', data.senderID, data.clock);
                return;
        }
    }

}

export type BroadcastSyncMessage = {
    type: 'update'|'state'|'getState';
    targetID: string | undefined;
    senderID: string;
    data: Uint8Array;
    clock: Map<string, number>
}