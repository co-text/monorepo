import {Fn} from "@cmmn/core";
import {EditorItem, EditorItemCollection} from "./types";

export class UiController implements EditorItemCollection{

    constructor(private root: HTMLElement) {
        this.fixItems();
        // this.subscribe(() => {});
    }

    subscribe(cb: (e) => any) {
        let skip = false;
        const mo = new MutationObserver((e) => {
            if (skip) return;
            skip = true;
            const fixed = this.fixItems();
            if (!fixed) {
                // console.log(e);
                cb(e);
            }
            skip = false;
        });
        mo.observe(this.root, {childList: true, subtree: true, characterData: true});
        return () => mo.disconnect();
    }

    private fixItems(){
        let fixed = false;
        let span = this.root.firstChild as HTMLSpanElement;
        while (span){
            if (span instanceof Comment)
                continue;
            const lines = recursiveGetText(span).split('\n');
            const content = lines.pop();
            for (let line of lines) {
                this.addChild(span, line, +span.style.getPropertyValue('--level'));
                fixed = true;
            }
            const isSpan =  (span instanceof HTMLSpanElement) || (span as Element).localName === 'span';
            const shouldReplace = !isSpan || span.childNodes.length > 1 ||
                (span.childNodes[0] && !(span.childNodes[0] instanceof Text));
            if (shouldReplace) {
                span = this.replaceChild(span, content);
                fixed = true;
            }
            if (!this.idMap.has(span)) {
                if (span.previousElementSibling.id == span.id){
                    console.log(span.previousElementSibling, span);
                    const id = span.id;
                    const newId = id.substring(0, id.lastIndexOf(':'))+':'+ Fn.ulid();
                    this.idMap.set(span, id)
                    this.map.set(id, span);
                    this.idMap.set(span.previousElementSibling as HTMLSpanElement, newId)
                    this.map.set(newId, span.previousElementSibling as HTMLSpanElement);
                    span.previousElementSibling.id = newId;
                    span.innerText = new Array(+span.style.getPropertyValue('--level')).fill(' ').join('')+span.innerText;
                } else {
                    const id = Fn.ulid();
                    this.idMap.set(span, id)
                    this.map.set(id, span);
                }
            }
            span.id = this.idMap.get(span);
            span = span.nextElementSibling as HTMLSpanElement;
        }
        return fixed;
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
        let index = 0;
        for (let span of this.getSpans()) {
            yield this.getItem(span);
            index++;
        }
    }
    private addChild(before: Element | undefined, content: string, level: number, id = Fn.ulid()){
        const span = document.createElement('span')
        span.textContent = content;
        span.style.setProperty('--level', level.toString());
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
        const level = +(child.style?.getPropertyValue('--level') ?? 0);
        const id = this.idMap.get(child) ?? child.id?.split(':').slice(0, -1).concat([Fn.ulid()]).join(':');
        const span = this.addChild(child, content || new Array(level).fill(' ').join(''), level, id);
        if (selection.containsNode(child)){
            selection.setPosition(span, selection.focusOffset);
        }
        child.remove();
        return span;
    }

    add(item: EditorItem, after: EditorItem, before: EditorItem) {
        const spanBefore = this.findSpan(before);
        this.addChild(spanBefore, item.Content, +item.level, item.path.join(':'));
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
        return item ? this.map.get(item.path.join(':')) : undefined;
    }
    private getItem(span: HTMLSpanElement): EditorItem{
        return span ? {
            get Content(){
                return recursiveGetText(span)
            },
            set Content(value: string){
                span.textContent = value;
            },
            level: +span.style.getPropertyValue('--level'),
            path: this.idMap.get(span).split(':')
        } : undefined;
    }

    pasteText(text: string) {
        const selection = document.getSelection();
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer.parentElement as HTMLElement;
        const endContainer = range.endContainer.parentElement as HTMLElement;
        if (startContainer != endContainer){
            const startText = startContainer.innerText;
            endContainer.innerText = startContainer.innerText + endContainer.innerText;
            let cursor = startContainer as Element;
            while (cursor != endContainer){
                let next = cursor.nextElementSibling;
                cursor.remove();
                cursor = next;
            }
            selection.setPosition(endContainer.firstChild, startText.length);
        }
        const startText = endContainer.innerText.slice(0, selection.focusOffset);
        const endText = endContainer.innerText.slice(selection.focusOffset);
        const lines = text.split('\n');
        const last = lines.pop();
        endContainer.textContent = last + endText;
        selection.setPosition(endContainer.firstChild, last.length);
        let cursor = range.endContainer as HTMLElement;
        for (let line of lines.reverse()) {
            cursor = this.addChild(cursor, line, +startContainer.style.getPropertyValue('--level'));
        }
        cursor.textContent = startText + cursor.textContent;
        return;
        // range.endContainer.textContent = last + end;
        // return;
        // const textNode = document.createTextNode(text);
        // range.insertNode(textNode);
        // range.setStartAfter(textNode);
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