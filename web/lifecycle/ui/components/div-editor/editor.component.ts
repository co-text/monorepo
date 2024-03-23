import { component, effect, ExtendedElement, HtmlComponent, property } from "@cmmn/ui";
import "./editor.style.less";
import { compare, Injectable } from "@cmmn/core";
import { cell } from "@cmmn/cell";
import { DomainCollection } from "./domain-collection";
import { IEvents, IState, template } from "./editor.template";
import { ContextClient, IContextProxy } from "@cotext/sdk/client";
import { TextMeasure } from "./text.measure";
import { CursorController } from "./cursor.controller";
import { ItemComponent } from "./item.component";
import { SelectionController } from "./selection.controller";
import { PointerController } from "./pointer.controller";
import { KeyboardController } from "./keyboard.controller";
import { ActionsController } from './actions.controller'

@Injectable(true)
@component({name: 'ctx-div-editor', template, style: ''})
export class DivEditorComponent extends HtmlComponent<IState, IEvents> implements IEvents {
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

    constructor() {
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
        return this.uri && ContextClient.get(this.uri);
    }

    @cell
    get model() {
        return new DomainCollection(this.ContextProxy);
    }

    @cell
    get items() {
        return [...this.model];
    }

    get State() {
        return {
            Items: this.items,
            Cursor: this.focus.Position,
            Anchor: this.anchor.Position,
            Selection: this.selection.Blocks,
            Focus: this.item,
        };
    }

    get item() {
        return this.focus.element?.item;
    }

    public measure = new TextMeasure(this.element as HTMLElement);
    public focus = new CursorController(this.measure);
    public anchor = new CursorController(this.measure);
    public actions = new ActionsController(this);
    public selection = new SelectionController(this);
    public pointer = new PointerController(this);
    public keyboard = new KeyboardController(this);

    addItem(input: HTMLInputElement) {
        this.model.addLast(input.value);
        input.value = '';
    }
}

