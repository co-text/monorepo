import {CursorController} from "./cursor.controller";
import {CursorMove, Point, SelectionBlock} from "./types";
import {Cell} from "@cmmn/cell";
import {ExtendedElement} from "@cmmn/ui";
import {ItemComponent} from "./item.component";

export class SelectionController {

    constructor(public cursor: CursorController, public anchor: CursorController) {
        Cell.OnChange(() => this.Blocks, e => {
            const selection = getSelection();
            try {
                if (this.anchor.element && this.cursor.element) {
                    selection.setBaseAndExtent(
                        this.anchor.element.element.firstChild, this.anchor.index,
                        this.cursor.element.element.firstChild, this.cursor.index,
                    );
                }
            }catch (e){
                console.warn(e);
            }
        })
    }

    get isEmpty(): boolean{
        return this.cursor.element === this.anchor.element && this.cursor.index == this.anchor.index;
    }

    public get Blocks(): Array<SelectionBlock>{
        if (!this.cursor.element || !this.anchor.element)
            return [];
        if (this.anchor.element == this.cursor.element){
            if (this.anchor.lineNumber == this.cursor.lineNumber) {
                return [{
                    id: `${this.anchor.element.item.id}.${this.anchor.lineNumber}`,
                    x: Math.min(this.anchor.Position.x, this.cursor.Position.x),
                    y: this.anchor.Position.y,
                    width: Math.abs(this.anchor.Position.x - this.cursor.Position.x),
                    text: this.anchor.Line.substring(
                        Math.min(this.anchor.lineIndex, this.cursor.lineIndex),
                        Math.max(this.anchor.lineIndex, this.cursor.lineIndex),
                    ),
                    level: this.anchor.element.item.level,
                }];
            }
            return  this.anchor.index > this.cursor.index
                ? Array.from(this.getBlocks(this.cursor, this.anchor))
                : Array.from(this.getBlocks(this.anchor, this.cursor))
        }
        const anchorPosition = this.anchor.element.BoundingRect;
        const cursorPosition = this.cursor.element.BoundingRect;
        if (anchorPosition.y < cursorPosition.y){
            return  Array.from(this.getBlocks(this.anchor, this.cursor))
        }
        return  Array.from(this.getBlocks(this.cursor, this.anchor))
    }

    private *getBlocks(from: CursorController, to: CursorController): Generator<SelectionBlock>{
        yield {
            id: `${from.element.item.id}.${from.lineNumber}`,
            x: from.Position.x,
            y: from.Position.y,
            width: from.measure.getWidth(from.Line.substring(from.lineIndex)),
            text: from.Line.substring(from.lineIndex),
            level: from.element.item.level,
        }
        if (from.element == to.element){
            for (let block of this.getElementBlocks(from.element, from.lineNumber + 1, to.lineNumber)) {
                yield block;
            }
        } else {
            for (let block of this.getElementBlocks(from.element, from.lineNumber + 1)) {
                yield block;
            }
            let element = from.element.element.nextElementSibling as ExtendedElement<ItemComponent>;
            while (element && element != to.element.element) {
                if (element.component){
                    for (let block of this.getElementBlocks(element.component)) {
                        yield block;
                    }
                }
                element = element.nextElementSibling as ExtendedElement<ItemComponent>;
            }
            for (let block of this.getElementBlocks(to.element, 0, to.lineNumber)) {
                yield block;
            }
        }
        yield {
            id: `${to.element.item.id}.${to.lineNumber}`,
            x: to.element.BoundingRect.x,
            y: to.Position.y,
            width: to.measure.getWidth(to.Line.substring(0, to.lineIndex)),
            text: to.Line.substring(0, to.lineIndex),
            level: to.element.item.level,
        }
    }

    private *getElementBlocks(component: ItemComponent, lineStart = 0, lineEnd = component.Lines.length): Generator<SelectionBlock> {
        for (let i = lineStart; i < lineEnd; i++) {
            yield {
                id: `${component.item.id}.${i}`,
                x: component.BoundingRect.x,
                y: `calc(${component.BoundingRect.y}*1px + ${i}*1em)`,
                width: this.anchor.measure.getWidth(component.Lines[i]),
                text: component.Lines[i],
                level: component.item.level,
            }
        }
    }

    move(type: CursorMove){
        this.expand(type);
        this.anchor.to(this.cursor);
    }

    expand(type: CursorMove) {
        switch (type){
            case CursorMove.Down: this.cursor.moveDown(); break;
            case CursorMove.Up: this.cursor.moveUp(); break;
            case CursorMove.Left: this.cursor.moveLeft(); break;
            case CursorMove.Right: this.cursor.moveRight(); break;
            case CursorMove.WordLeft: this.cursor.moveWordLeft(); break;
            case CursorMove.WordRight: this.cursor.moveWordRight(); break;
            case CursorMove.Home: this.cursor.moveHome(); break;
            case CursorMove.End: this.cursor.moveEnd(); break;
        }
    }

    selectTarget(target: ItemComponent) {
        this.anchor.itemId = target.item.id;
        this.anchor.index = 0;
        this.cursor.itemId = target.item.id;
        this.cursor.index = target.item.Content.length;
    }

    selectCurrentWord(target: ItemComponent, point: Point) {
        this.cursor.moveToPoint(target, point);
        this.cursor.moveWordRight();
        this.anchor.to(this.cursor);
        this.anchor.moveWordLeft();
    }
}