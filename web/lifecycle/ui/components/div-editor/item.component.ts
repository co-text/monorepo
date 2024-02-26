import {component, ExtendedElement, HtmlComponent, ITemplate, property} from "@cmmn/ui";
import {MessageItem} from "./message-item";
import {cell, ObservableMap} from "@cmmn/cell";
import {DivEditorComponent} from "./editor.component";
import {Injectable, Lazy} from "@cmmn/core";

type IState = {
    Content: string;
}
export const template: ITemplate<IState, any> = (html, {Content}) => html`
    ${Content}
`
@Injectable(true)
@component({name: 'ctx-editor-item', template, style: ''})
export class ItemComponent extends HtmlComponent<IState>{

    @cell({startValue: new ObservableMap()})
    static ItemBindingMap: ObservableMap<string, ItemComponent>;

    focus() {
        this.element.focus();
    }

    public get BoundingRect(){
        const scrollTop = this.element.parentElement.parentElement.scrollTop;
        const rect = this.element.getBoundingClientRect();
        return {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
            y: rect.y + scrollTop,
            x: rect.x,
        }
    }

    constructor() {
        super();
    }
    @property()
    isFocused: boolean;
    @property()
    item: MessageItem;
    @cell
    width: number;
    @cell
    lineHeight: number;

    get State(){
        return {
            Content: this.item.Content
        }
    }

    connectedCallback() {
        super.connectedCallback();
        const style = getComputedStyle(this.element);
        this.width = +style.width.replace('px','');
        this.lineHeight = +style.lineHeight.replace('px','');
        this.element.toggleAttribute('contenteditable');
        this.element.setAttribute('spellcheck', 'false');
        if (this.isFocused){
            this.element.focus();
        }
        ItemComponent.ItemBindingMap.set(this.item.id, this);
    }

    disconnectedCallback() {
        this.element.toggleAttribute('contenteditable');
        super.disconnectedCallback();
        ItemComponent.ItemBindingMap.delete(this.item.id);
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