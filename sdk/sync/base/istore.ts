import { EventEmitter } from "@cmmn/core";

export interface ISyncStore extends EventEmitter<{patch: Uint8Array} & any>{
    init: Promise<void>;
    id: any;
    clock: any;
    getState(): Uint8Array;
    load(state: Uint8Array);
    applyPatch(data: Uint8Array, clock: any);
}