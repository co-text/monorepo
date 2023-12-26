import {EventEmitter, Fn} from "@cmmn/core";
import {EditorItem, EditorItemCollection} from "./types";

export class DomItemCollection extends EventEmitter<any> implements EditorItemCollection{

    constructor(private root: HTMLElement) {
        super();
    }

    private fixItems(){
        if (!this.root) return;
        let span = this.root.firstChild as HTMLSpanElement;
        while (span){
            if (span instanceof Comment)
                continue;
            const lines = recursiveGetText(span).split('\n');
            const content = lines.pop();
            for (let line of lines) {
                this.addChild(span, line);
            }
            const isSpan =  (span instanceof HTMLSpanElement) || (span as Element).localName === 'span';
            const shouldReplace = !isSpan || span.childNodes.length !== 1 ||
                !(span.childNodes[0] instanceof Text);
            if (shouldReplace) {
                span = this.replaceChild(span, content);
            }
            if (!this.idMap.has(span)) {
                const id = Fn.ulid();
                this.idMap.set(span, id)
                this.map.set(id, span);
            }
            span.id = this.idMap.get(span);
            span = span.nextElementSibling as HTMLSpanElement;
        }
    }
    private* getSpans(): IterableIterator<HTMLSpanElement> {
        if (!this.root) return;
        let span = this.root.firstElementChild as HTMLSpanElement;
        while (span){
            if (span instanceof Comment)
                continue;
            yield span;
            span = span.nextElementSibling as HTMLSpanElement;
        }
    }
    public* [Symbol.iterator](): IterableIterator<EditorItem> {
        this.fixItems();
        let index = 0;
        for (let span of this.getSpans()) {
            yield this.getItem(span);
            index++;
        }
    }
    private addChild(before: Element | undefined, content: string, id = Fn.ulid()){
        const span = document.createElement('span')
        span.textContent = content;
        this.idMap.set(span, id);
        this.map.set(id, span);
        span.id = id;
        if (before) {
            this.root.insertBefore(span, before);
        }else {
            this.root.appendChild(span);
        }
        return span;
    }

    private replaceChild(child: HTMLElement, content: string){
        const selection = document.getSelection();
        const span = this.addChild(child, content, this.idMap.get(child));
        if (selection.containsNode(child)){
            selection.setPosition(span, selection.focusOffset);
        }
        child.remove();
        return span;
    }

    addBefore(before: EditorItem | undefined, item: EditorItem) {
        const spanBefore = this.findSpan(before);
        this.addChild(spanBefore, item.Content, item.id);
    }

    remove(item: EditorItem) {
        const spanBefore = this.findSpan(item);
        spanBefore?.remove();
    }
    moveBefore(before: EditorItem, item: EditorItem): void {
        const child = this.findSpan(before);
        const span = this.findSpan(item);
        this.root.insertBefore(span, child);
    }

    findItem(item: EditorItem): EditorItem {
        return this.getItem(this.findSpan(item));
    }

    private map = new Map<string, HTMLSpanElement>();
    private idMap = new WeakMap<HTMLSpanElement, string>();
    findSpan(item: EditorItem): HTMLSpanElement {
        return item ? this.map.get(item.id) : undefined;
    }
    private getItem(span: HTMLSpanElement){
        return span ? {
            get Content(){
                return recursiveGetText(span)
            },
            set Content(value: string){
                span.textContent = value;
            },
            id: this.idMap.get(span)
        } : undefined;
    }
}

function recursiveGetText(node: Node) {
    if (node instanceof HTMLBRElement) {
        // node.remove();
        return '';
    }
    if (node instanceof Text)
        return node.textContent;
    if (node instanceof Comment)
        return '';
    const texts = [];
    for (let childNode of Array.from(node.childNodes)) {
        texts.push(recursiveGetText(childNode));
    }
    return texts.join('');
}