import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./under.template";
import style from "./under.style.less";
import {Injectable} from "@cmmn/core";
import {P2PService} from "@infr/p2p.service";

@Injectable(true)
@component({name: 'app-under', template, style})
export class UnderComponent extends HtmlComponent<IState, IEvents> {

    constructor(private p2p: P2PService) {
        super();
    }

    get State() {
        return {
            streams: Array.from(this.p2p.streams.values()).map(x => ({
                id: x.id,
                type: x.multiplexer
            }))
        };
    }
}
