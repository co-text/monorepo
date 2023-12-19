import {component, HtmlComponent, property} from "@cmmn/ui";
import {template, IState, IEvents} from "./test-root.template";
import style from "./test-root.style.less";
import {Fn, Injectable} from "@cmmn/core";
import {cell, Cell} from "@cmmn/cell";
import {P2PService} from "@infr/p2p.service";
import {Api} from "@infr/api";

@Injectable(true)
@component({name: 'app-root', template, style})
export class TestRootComponent extends HtmlComponent<IState, IEvents> {

    @property()
    private property!: any;

    get State() {
        return {
            nodesCount: this.nodesCount
        }
    }
    @cell
    nodesCount = 0;
    constructor(private api: Api){
        super();
        this.runTest();
    }

    async runTest(){
        const peerId = await this.api.getPeerId();
        while (true){
            const p2p = new P2PService();
            await p2p.init(peerId);
            await p2p.stop();
            this.nodesCount++;
        }
    }
}
