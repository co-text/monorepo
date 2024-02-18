import {action, select, component, event, HtmlComponent, property} from "@cmmn/ui";
import "./editor.style.less";
import {compare, Injectable} from "@cmmn/core";
import {cell} from "@cmmn/cell";
import {DomainCollection} from "./domain-collection";
import {IEvents, IState, template} from "./editor.template";
import {MergeController} from "./merge-controller";
import {UiController} from "./ui-controller";
import {DomainProxy, IContextProxy} from "@proxy";

@Injectable(true)
@component({name: 'ctx-editor', template, style: ''})
export class EditorComponent extends HtmlComponent<IState, IEvents> {
    @property()
    private uri!: string;
    @select('[contenteditable]')
    private ce!: HTMLDivElement;

    constructor(protected readonly domain: DomainProxy) {
        super();
    }
    @cell({compareKey: a => a?.State, compare})
    get ContextProxy(): IContextProxy {
        return this.uri && this.domain.getContext(this.uri);
    }

    @cell
    get model() {
        return new DomainCollection(this.ContextProxy);
    }

    @cell
    private get ui(): UiController | null {
        return this.ce ? new UiController(this.ce) : null;
    }
    @cell
    get MergeItemsController(){
        return this.ui && this.model ? new MergeController(this.model, this.ui) : null;
    }


    @action(function (this: EditorComponent) {return this.MergeItemsController;})
    listenEffect(){
        return this.MergeItemsController?.listen();
    }

    get State() {
        return {
            Items: [...this.model]
        };
    }

    @event('keydown')
    listenTab(e: KeyboardEvent) {
        if (e.key == 'Tab'){
            e.preventDefault();

        }
    }

    fromModel(){
        this.MergeItemsController.fromModel();
    }

    fromUI(){
        this.MergeItemsController.fromUI();
    }
}
