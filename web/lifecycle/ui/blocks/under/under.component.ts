import { component, HtmlComponent } from "@cmmn/ui";
import { IEvents, IState, template } from "./under.template";
import style from "./under.style.less";
import { Injectable } from "@cmmn/core";

@Injectable(true)
@component({name: 'app-under', template, style})
export class UnderComponent extends HtmlComponent<IState, IEvents> {

    constructor() {
        super();
    }

    get State() {
        return undefined;
        // return {
        //     streams: Array.from(this.p2p.streams.values()).map(x => ({
        //         id: x.id,
        //         type: 'any', //x.stream.protocol
        //     }))
        // };
    }
}
