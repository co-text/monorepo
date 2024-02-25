import {component, ExtendedElement, HtmlComponent, ITemplate, property} from "@cmmn/ui";
import {MessageItem} from "./message-item";
import {cell} from "@cmmn/cell";
import {DivEditorComponent} from "./editor.component";
import {Injectable, Lazy} from "@cmmn/core";

type IState = {
    item: MessageItem;
}
export const template: ITemplate<IState, any> = (html, {item}) => html`
    ${item.Content}
`
@Injectable(true)
@component({name: 'ctx-editor-item', template, style: ''})
export class ItemComponent extends HtmlComponent<any>{

    public get BoundingRect(){
        return this.element.getBoundingClientRect();
    }

    constructor() {
        super();
    }

    @property()
    index: number;
    @property()
    item: MessageItem;

    @cell
    width: number;
    @cell
    lineHeight: number;

    get State(){
        return {
            item: this.item
        }
    }

    connectedCallback() {
        super.connectedCallback();
        const style = getComputedStyle(this.element);
        this.width = +style.width.replace('px','');
        this.lineHeight = +style.lineHeight.replace('px','');
        this.element.toggleAttribute('contenteditable');
        this.element.setAttribute('spellcheck', 'false');
    }

    disconnectedCallback() {
        this.element.toggleAttribute('contenteditable');
        super.disconnectedCallback();
    }

    onResize() {
        const style = getComputedStyle(this.element);
        this.width = +style.width.replace('px','');
        this.lineHeight = +style.lineHeight.replace('px','');
    }

    @Lazy
    get editor(): DivEditorComponent {
        let parent = this.element.parentElement as ExtendedElement<DivEditorComponent>;
        while (parent.component == null || !(parent.component instanceof DivEditorComponent)) {
            parent = parent.parentElement;
        }
        return parent.component;
    }


    @cell
    get Lines(): string[] {
        return Array.from(this.editor.textMeasure.getLines(this.item.Content, this.width));
    }

}