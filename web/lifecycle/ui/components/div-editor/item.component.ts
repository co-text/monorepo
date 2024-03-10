import {action, component, effect, ExtendedElement, HtmlComponent, ITemplate, property} from "@cmmn/ui";
import {MessageItem} from "./message-item";
import {cell, ObservableMap} from "@cmmn/cell";
import {DivEditorComponent} from "./editor.component";
import {Injectable, Lazy} from "@cmmn/core";

type IState = {
}
export const template: ITemplate<IState, any> = (html) => html`
`
@Injectable(true)
@component({name: 'ctx-editor-item', template, style: ''})
export class ItemComponent extends HtmlComponent<IState>{
    element: HTMLDivElement;

    @cell({startValue: new ObservableMap()})
    static ItemBindingMap: ObservableMap<string, ItemComponent>;

    focus() {
        (this.element.children.item(this.editor.cursor.lineIndex) as HTMLElement)?.focus();
            // console.log('focus')
        // }
    }

    public get BoundingRect(){
        const scrollTop = this.element.parentElement.parentElement.scrollTop;
        const rect = this.element.getBoundingClientRect();
        return {
            top: rect.top + scrollTop,
            bottom: rect.bottom + scrollTop,
            y: rect.y + scrollTop,
            x: rect.x,
            width: rect.width,
            height: rect.height
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
        return undefined;
    }
    @action(function (this: ItemComponent) { return this.Lines; })
    onChange(){
        for (let i = 0; i < this.Lines.length; i++) {
            const childNode = this.element.childNodes.item(i);
            if (!childNode){
                const span = document.createElement('span');
                span.textContent = this.Lines[i];
                this.element.appendChild(span);
                continue;
            }
            if (!(childNode instanceof HTMLSpanElement)){
                const span = document.createElement('span');
                span.textContent = this.Lines[i];
                this.element.insertBefore(span, childNode);
                childNode.remove();
                continue;
            }
            if (childNode.textContent !== this.Lines[i]){
                childNode.textContent = this.Lines[i];
            }
        }
        while(this.element.childNodes.length > this.Lines.length){
            this.element.childNodes.item(this.Lines.length).remove();
        }
        // if (this.item.Content != this.element.innerText){
        //     this.element.innerText = this.item.Content;
        // }
    }

    connectedCallback() {
        super.connectedCallback();
        const style = getComputedStyle(this.element);
        this.width = +style.width.replace('px','');
        this.lineHeight = +style.lineHeight.replace('px','');
        this.element.toggleAttribute('contenteditable');
        this.element.setAttribute('spellcheck', 'false');
        if (this.isFocused){
            this.focus();
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
        return Array.from(this.editor.textMeasure.getLines(this.item.Content, this.width ?? this.BoundingRect.width));
    }

}