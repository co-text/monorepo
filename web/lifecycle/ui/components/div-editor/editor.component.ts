import {select, component, event, HtmlComponent, property, ExtendedElement} from "@cmmn/ui";
import "./editor.style.less";
import {compare, Injectable} from "@cmmn/core";
import {cell} from "@cmmn/cell";
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

@Injectable(true)
@component({name: 'ctx-div-editor', template, style: ''})
export class DivEditorComponent extends HtmlComponent<IState, IEvents> {
    @property()
    private uri!: string;
    private resizeObserver = new ResizeObserver(() => {
        this.element.querySelectorAll('ctx-editor-item').forEach(
            (element: ExtendedElement<ItemComponent>) => element.component?.onResize()
        );
    });

    constructor(protected readonly domain: DomainProxy) {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this.resizeObserver.observe(this.element);
        this.onDispose = this.pointer.subscribe();
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
        console.log(...this.selection.Blocks.map(x => x.id))
        return {
            Items: [...this.model],
            Cursor: this.cursor.Position,
            Anchor: this.anchor.Position,
            Selection: this.selection.Blocks
        };
    }

    public textMeasure = new TextMeasure(this.element as HTMLElement);
    public cursor = new CursorController(this.textMeasure);
    public anchor = new CursorController(this.textMeasure);
    public selection = new SelectionController(this.cursor, this.anchor);
    public pointer = new PointerController(this.element as HTMLElement, this.selection);

    @event('keydown')
    onKeyDown(event: KeyboardEvent) {
        const modifiers = ['Alt', 'Ctrl', 'Shift'].filter(x => event[x.toLowerCase() + 'Key']);
        const modKey = modifiers.join('') + event.code;
        if (modKey in KeyboardActions){
            KeyboardActions[modKey]({
                model: this.model,
                item: this.pointer.focus.item,
                selection: this.selection,
                measure: this.textMeasure,
                event
            });
            event.preventDefault();
        } else {
            console.log(modKey);
        }
    }

    @event('input')
    onInput(e: KeyboardEvent) {
        const target = e.target as HTMLItem;
        if (!this.cursor.cursor) return;
        const oldText = target.component.item.Content;
        const newText = target.innerText;
        target.component.item.Message.UpdateContent(newText);
        console.log(this.cursor.Position);
    }

}

type HTMLItem = ExtendedElement<ItemComponent> & HTMLDivElement;