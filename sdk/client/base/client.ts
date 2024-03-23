import { LWWCell } from './lww-cell'
import { Channel, Op } from '../../common'
import { DeepPartial, Fn } from "@cmmn/core";

const clientId = sessionStorage.getItem("clientId") ?? (() => {
    const c = Fn.ulid();
    sessionStorage.setItem('clientId', c);
    return c;
})();

export abstract class Client<T> extends LWWCell<T> {
    private static channel = new Channel<any>('sdk', clientId);

    constructor() {
        super(null);
    }

    abstract get path(): string;

    private onDisactive: Function;

    public active() {
        super.active();
        Client.channel.send(this.path, {clock: this.now(), action: 'active'});
        this.onDisactive = Client.channel.on(this.path, e => {
            if (!e.state) return;
            this.setAt(e.clock, e.state);
        });
    }

    public disactive() {
        super.disactive();
        Client.channel.send(this.path, {clock: this.now(), action: 'disactive'});
        this.onDisactive();
    }

    public action(patch: Patch<T> | T, op: Op, data: any[]) {
        const clock = this.now();
        if (typeof patch === "function") {
            this.setAt(clock, (patch as Patch<T>)(this.get()))
        } else {
            this.setAt(clock, patch);
        }
        Client.channel.send(this.path, {clock, op, data});
    }

    public patch(diff: DeepPartial<T>) {
        this.action(s => Fn.deepAssign({}, s, diff), Op.patch, [diff]);
    }
}

export type Patch<T> = ((t: T) => T);