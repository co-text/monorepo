import {Cell, cell} from "@cmmn/cell";
import {Cursor} from "./types";
import {TextMeasure} from "./text.measure";
import {MessageItem} from "./message-item";
import {ItemComponent} from "./item.component";
import {sum} from "@cmmn/core";
import {ExtendedElement} from "@cmmn/ui";

export class CursorController {

    constructor(public measure: TextMeasure) {

    }

    @cell
    itemId: string;

    get element(): ItemComponent{
        const element = ItemComponent.ItemBindingMap.get(this.itemId);
        if (!element?.element?.parentElement)
            return  null;
        return element;
    }
    get item(): MessageItem {
        return this.element?.item;
    }
    get node(){
        return this.element.element.childNodes.item(this.lineNumber)?.firstChild ?? this.element.element.childNodes.item(this.lineNumber);
    }

    get contentParts(){
        return [
            this.item.Content.substring(0, this.index),
            this.item.Content.substring(this.index),
        ]
    }
    @cell
    index: number;
    get lineIndex() { return this.index - sum(this.element.Lines.slice(0, this.lineNumber).map(x => x.length)); }
    set lineIndex(index: number) {
        this.index  = index + sum(this.element.Lines.slice(0, this.lineNumber).map(x => x.length)); 
    }
    @cell
    public get cursor(): Readonly<Cursor> | undefined{
        return this.element ? {
            item: this.item,
            index: this.index,
            line: this.lineNumber,
            x: this.position
        } : null;
    }


    public get Position(){
        if (!this.element) return null;
        const rect = this.element.BoundingRect;
        return {
            x: this.position + rect.x,
            y: `calc(${this.lineNumber}*1em + ${rect.y}*1px)`
        };
    }

    public get Line(){
        return this.element.Lines[this.lineNumber];
    }

    public get LineWidth(){
        return this.measure.getWidth(this.Line);
    }

    @cell
    get lineNumber(){
        const lines = this.element.Lines;
        let index = 0;
        for (var line = 0; line < lines.length; line++){
            const lineLength = lines[line].length;
            index += lineLength;
            if (index > this.index)
                return line;
        }
        return line - 1;
    }

    private get position(){
        return this.measure.getWidth(this.Line.substring(0, this.lineIndex));
    }

    moveLeft() {
        if (this.index > 0){
            return this.index--;
        }
        const prev = this.element.element.previousElementSibling as ExtendedElement<ItemComponent>;
        if (!prev?.component) return ;
        this.itemId = prev.component.item.id;
        this.index = this.element.item.Content.length;
    }

    moveDown() {
        if (this.lineNumber < this.element.Lines.length - 1){
            this.index = this.measure.getPosition(this.element.Lines[this.lineNumber + 1], this.position)
                 + sum(this.element.Lines.slice(0, this.lineNumber + 1).map(x => x.length));
            return;
        }
        const position = this.position;
        const next = this.element.element.nextElementSibling as ExtendedElement<ItemComponent>;
        if (!next?.component) return ;
        this.itemId = next.component.item.id;
        this.index = this.measure.getPosition(this.element.Lines[0], position);
    }
    moveUp() {
        if (this.lineNumber > 0){
            this.index = this.measure.getPosition(this.element.Lines[this.lineNumber - 1], this.position)
                + sum(this.element.Lines.slice(0, this.lineNumber - 1).map(x => x.length));
            return;
        }
        const position = this.position;
        const prev = this.element.element.previousElementSibling as ExtendedElement<ItemComponent>;
        if (!prev?.component) return ;
        this.itemId = prev.component.item.id;
        this.index = this.measure.getPosition(this.element.Lines.at(-1), position)
            + sum(this.element.Lines.slice(0, -1).map(x => x.length));
    }

    moveRight() {
        if (this.index < this.element.item.Content.length) {
            this.index++;
            return;
        }
        const next = this.element.element.nextElementSibling as ExtendedElement<ItemComponent>;
        if (!next?.component) return ;
        this.itemId = next.component.item.id;
        this.index = 0;
    }

    moveToPoint(element: ItemComponent, point: {x: number, y: number}) {
        this.itemId = element.item.id;
        const line = Math.floor(point.y / element.lineHeight);
        if (line < 0)
            return this.index = 0;
        if (line >= element.Lines.length)
            return this.index = this.element.item.Content.length;
        const text = element.Lines[line];
        return this.index = this.measure.getPosition(text, point.x)
            + sum(element.Lines.slice(0, line).map(x => x.length));
    }

    moveWordRight() {
        if (this.index == this.element.item.Content.length)
            this.moveRight();
        const text = this.element.item.Content;
        const index = text.indexOf(' ', this.index + 1);
        this.index = index == -1 ? text.length : index;
    }

    moveWordLeft() {
        if (this.index == 0)
            this.moveLeft();
        const text = this.element.item.Content;
        const index = text.lastIndexOf(' ', this.index - 2);
        this.index = index == -1 ? 0 : index + 1;
    }

    to(cursor: CursorController) {
        this.itemId = cursor.itemId;
        this.index = cursor.index;
    }

    moveEnd() {
        this.lineIndex = this.Line.length;
    }

    moveHome() {
        this.lineIndex = 0;
    }
}

