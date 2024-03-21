import { Channel } from "../../common";
import { Cell } from "@cmmn/cell";
import { getOrAdd } from "@cmmn/core";

export class Domain {
    private channel = new Channel<any>("sdk");

    private cache = new Map<string, InstanceData>();

    constructor(private getInstance: (id: string) => {get State(): any;}) {
    }

    subscribe(){
        this.channel.on(Channel.ANY, (message) => {
            if (!message.data) return;
            if (!message.id) return;

            const x = getOrAdd(this.cache, message.id, id => {
                const instance = this.getInstance(id)
                return {
                    instance,
                } as InstanceData;
            });

            x.clock = message.data.clock;
            switch (message.data.action) {
                case "active":
                    x.subscription = Cell.OnChange(() => x.instance.State, e =>
                        this.channel.send(message.id, {
                            clock: x.clock,
                            state: e.value
                        })
                    );
                    this.channel.send(message.id, {
                        clock: message.data.clock,
                        state: x.instance.State
                    });
                    break;
                case "disactive":
                    // x.subscription();
                    break;
                default:
                    if (!message.data.data) return;
                    x.instance[message.data.op](...message.data.data);
            }

        });
    }

}

type IModel<T> = {
    get State(): T;
}
type InstanceData = {
    instance: IModel<any>;
    clock: number;
    subscription: Function;
}