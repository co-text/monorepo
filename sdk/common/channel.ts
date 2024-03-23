import { EventEmitter, Fn, ResolvablePromise } from '@cmmn/core'
import { Op } from "./op";

const ANY = Symbol('any');

export class Channel<T> extends EventEmitter<Record<string, Message<T>> & {
    [ANY]: { id: string; data: Message<T> }
}> {
    public static ANY: typeof ANY = ANY;
    private base = new BroadcastChannel(this.name);
    private connected = new ResolvablePromise<void>();
    static domain: string = 'domain';

    constructor(private name: string, private clientId: string) {
        super();
    }

    private isSubscribed = false;

    protected subscribe(eventName: keyof Record<string, T>) {
        super.subscribe(eventName)
        if (this.isSubscribed) return;
        this.isSubscribed = true;
        this.base.addEventListener('message', this.onMessage);
        this.base.postMessage(this.clientId);
    }

    protected unsubscribe(eventName: keyof Record<string, T>) {
        super.unsubscribe(eventName)
        if (!this.isSubscribed) return;
        this.isSubscribed = false;
        this.base.removeEventListener('message', this.onMessage);
    }

    private onMessage = (event: MessageEvent<string | { id: string; data: Message<any> }[]>) => {
        // console.log(event.data ?? 'connected', globalThis);
        if (typeof event.data === "string") {
            if (this.clientId == Channel.domain) {
                this.connected.resolve();
                this.base.postMessage(event.data);
                return;
            }
            if (event.data == Channel.domain) {
                this.connected.resolve();
                this.base.postMessage(this.clientId);
                return;
            }
            if (event.data === this.clientId)
                this.connected.resolve();
            return;
        }
        for (let data of event.data) {
            if (!data.id || !data.data) return;
            this.emit(data.id, data.data);
            this.emit(ANY, data);
        }
    }

    public async send(id: string, data: Message<T>) {
        this.queue.push({id, data: data});
        // dequeue in microtasks
        await this.connected;
        await Fn.asyncDelay(0);
        this.dequeue();
    }

    private queue = [];

    private dequeue() {
        if (!this.queue.length) return;
        this.base.postMessage(this.queue);
        this.queue.length = 0;
    }
}


type Message<T> = {
    clock: number;
    state?: T;
    op?: Op;
    data?: any[];
    action?: 'active' | 'disactive';
}