import {select, component, event, HtmlComponent, property, ExtendedElement, effect} from "@cmmn/ui";
import "./editor.style.less";
import {compare, Injectable} from "@cmmn/core";
import {BaseCell, cell} from "@cmmn/cell";
import {DomainCollection} from "./domain-collection";
import {IEvents, IState, template} from "./editor.template";
import {DomainProxy, IContextProxy} from "@proxy";
import {MessageItem} from "./message-item";
import {KeyboardActions} from "./keyboard.actions";
import {TextMeasure} from "./text.measure";
import {CursorController} from "./cursor.controller";
import {ItemComponent} from "./item.component";
import {SelectionController} from "./selection.controller";
import {PointerController} from "./pointer.controller";
import {EditorContext} from "./types";
import {KeyboardController} from "./keyboard.controller";

@Injectable(true)
@component({name: 'ctx-div-editor', template, style: ''})
export class DivEditorComponent extends HtmlComponent<IState, IEvents> {
    @property()
    private uri!: string;
    private resizeObserver = new ResizeObserver(() => {
        this.element.querySelectorAll('ctx-editor-item').forEach(
            (element: ExtendedElement<ItemComponent>) => element.component?.onResize()
        );
        globalThis.visualViewport?.addEventListener('resize', (e) => {
            this.element.style.height = globalThis.visualViewport.height + 'px';
        })
    });

    constructor(protected readonly domain: DomainProxy) {
        super();
    }

    @effect()
    async onFirstRender() {
        this.resizeObserver.observe(this.element);
        this.onDispose = this.pointer.subscribe();
        this.onDispose = this.keyboard.subscribe();
    }

    disconnectedCallback() {
        this.resizeObserver.unobserve(this.element);
        super.disconnectedCallback();
    }

    @cell({compareKey: a => a?.State, compare})
    get ContextProxy(): IContextProxy {
        return this.uri && this.domain.getContext(this.uri);
    }

    @cell
    get model() {
        return new DomainCollection(this.ContextProxy);
    }

    get State() {
        return {
            Items: [...this.model],
            Cursor: this.cursor.Position,
            Anchor: this.anchor.Position,
            Selection: this.selection.Blocks,
            Focus: this.cursor.element?.item,
        };
    }

    public textMeasure = new TextMeasure(this.element as HTMLElement);
    public cursor = new CursorController(this.textMeasure);
    public anchor = new CursorController(this.textMeasure);
    public selection = new SelectionController(this.cursor, this.anchor);

    public EditorContext = new BaseCell<EditorContext>(() =>{
        return {
            element: this.element,
            model: this.model,
            item: this.cursor.element?.item,
            selection: this.selection,
            measure: this.textMeasure,
        }
    });
    public pointer = new PointerController(this.EditorContext);
    public keyboard = new KeyboardController(this.EditorContext);

    addItem(input: HTMLInputElement){
        this.model.addLast(input.value);
        input.value = '';
    }
}

