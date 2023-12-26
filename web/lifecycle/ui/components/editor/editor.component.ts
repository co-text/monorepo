import {event, action, select, component, effect, HtmlComponent, KeyboardListener, property} from "@cmmn/ui";
import "./editor.style.less";
import {compare, Fn, Injectable} from "@cmmn/core";
import {Cell, cell} from "@cmmn/cell";
import {DomainCollection} from "./domain-collection";
import {IEvents, IState, template} from "./editor.template";
import {DomainProxy, IContextProxy} from "@proxy";
import {CeController} from "./ce-controller";
import {DomItemCollection} from "./dom-item-collection";

@Injectable(true)
@component({name: 'ctx-editor', template, style: ''})
export class EditorComponent extends HtmlComponent<IState, IEvents> {
    @property()
    private uri!: string;

    constructor(protected readonly root: DomainProxy) {
        super();
    }

    @cell({compareKey: a => a?.State, compare})
    get ContextProxy(): IContextProxy {
        return this.uri && this.root.getContext(this.uri);
    }

    @cell
    get ItemsCollection() {
        return new DomainCollection(this.ContextProxy);
    }

    @cell
    get CeController(){
        return new CeController(this.ItemsCollection);
    }

    @event('input')
    onInputEvent(e: Event) {
        this.CeController.update();
    }

    get State() {
        return {
            Element: this.CeController.ce,
            Items: [...this.ItemsCollection]
        };
    }
}
