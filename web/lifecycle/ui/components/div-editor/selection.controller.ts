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
                        this.anchor.element.element.firstChild ?? this.anchor.element.element, this.anchor.index,
                        this.cursor.element.element.firstChild ?? this.cursor.element.element, this.cursor.index,
                    );
                    // console.log(
                    //     'Selection Model',
                    //     // @ts-ignore
                    //     [getSelection().anchorNode?.textContent, getSelection().focusNode?.textContent],
                    //     [getSelection().anchorNode, getSelection().focusNode],
                    // )
                }
            } catch (e) {
                console.warn(e);
            }
        });
        // document.addEventListener('selectionchange', e => {
        //     console.log(
        //         'selectionchange',
        //         // @ts-ignore
        //         [getSelection().anchorNode?.textContent, getSelection().focusNode?.textContent],
        //         [getSelection().anchorNode, getSelection().focusNode],
        //     )
        // })
    }

    setFromWindow(){
        const selection = getSelection();
        this.anchor.itemId = selection.anchorNode.parentElement.id;
        this.anchor.index = selection.anchorOffset;
        this.cursor.itemId = selection.focusNode.parentElement.id;
        this.cursor.index = selection.focusOffset;
    }

    get isEmpty(): boolean {
        return this.cursor.element === this.anchor.element && this.cursor.index == this.anchor.index;
    }

    get isOneItem() {
        return this.anchor.element == this.cursor.element;
    }

    get isOneLine() {
        return this.isOneItem && this.anchor.lineNumber == this.cursor.lineNumber;
    }

    public get Blocks(): Array<SelectionBlock> {
        if (!this.cursor.element || !this.anchor.element)
            return [];
        return Array.from(this.getBlocks())
    }

    private get OrderedCursors(): [CursorController, CursorController] {
        if (this.isOneItem){
            return this.anchor.index > this.cursor.index
                ? [this.cursor, this.anchor]
                : [this.anchor, this.cursor]
        }
        const anchorPosition = this.anchor.element.BoundingRect;
        const cursorPosition = this.cursor.element.BoundingRect;
        return anchorPosition.y < cursorPosition.y
            ? [this.anchor, this.cursor]
            : [this.cursor, this.anchor];
    }

    private* getSelectionRanges(): Generator<SelectionRange> {
        const [from, to] = this.OrderedCursors;

        function getElementLines(element: ItemComponent, from: number, to: number) {
            return new Array(to - from).fill(0).map((_, i) => ({
                number: i + from,
                range: [0, element.Lines[i + from].length]
            } as LineSelectionRange));
        }

        if (from.element == to.element) {
            if (from.lineNumber == to.lineNumber){
                yield {
                    element: from.element,
                    range: [from.index, to.index],
                    lines: [
                        {
                            number: from.lineNumber,
                            range: [from.lineIndex, to.lineIndex],
                        }
                    ]
                }
            } else {
                yield {
                    element: from.element,
                    range: [from.index, to.index],
                    lines: [
                        {
                            number: from.lineNumber,
                            range: [from.lineIndex, from.Line.length],
                        },
                        ...getElementLines(to.element, from.lineNumber + 1, to.lineNumber),
                        {
                            number: to.lineNumber,
                            range: [0, to.lineIndex],
                        }
                    ]
                }
            }
            return;
        }
        yield {
            element: from.element,
            range: [from.index, from.element.item.Content.length],
            lines: [{
                number: from.lineNumber,
                range: [from.lineIndex, from.Line.length],
            }, ...getElementLines(from.element, from.lineNumber + 1, from.element.Lines.length)]
        }
        let element = from.element.element.nextElementSibling as ExtendedElement<ItemComponent>;
        while (element && element != to.element.element) {
            yield {
                element: element.component,
                range: [0, element.component.item.Content.length],
                lines: getElementLines(element.component, 0, element.component.Lines.length)
            }
            element = element.nextElementSibling as ExtendedElement<ItemComponent>;
        }
        yield {
            element: to.element,
            range: [0, to.index],
            lines: [ ...getElementLines(to.element, 0, to.lineNumber), {
                number: to.lineNumber,
                range: [0, to.lineIndex],
            },]
        }
    }

    private* getBlocks(): Generator<SelectionBlock> {
        for (let selectionRange of this.getSelectionRanges()) {
            for (let line of selectionRange.lines) {
                const lineText = selectionRange.element.Lines[line.number];
                const text = lineText.substring(line.range[0], line.range[1]);
                const startText = lineText.substring(0, line.range[0]);
                yield {
                    id: `${selectionRange.element.item.id}.${line.number}`,
                    x: selectionRange.element.BoundingRect.x + this.anchor.measure.getWidth(startText),
                    y: `calc(${selectionRange.element.BoundingRect.y}*1px + ${line.number}*1em)`,
                    width: this.anchor.measure.getWidth(text),
                    text: text,
                    level: selectionRange.element.item.level,
                }
            }
        }
    }

    move(type: CursorMove) {
        this.expand(type);
        this.anchor.to(this.cursor);
    }

    expand(type: CursorMove) {
        switch (type) {
            case CursorMove.Down:
                this.cursor.moveDown();
                break;
            case CursorMove.Up:
                this.cursor.moveUp();
                break;
            case CursorMove.Left:
                this.cursor.moveLeft();
                break;
            case CursorMove.Right:
                this.cursor.moveRight();
                break;
            case CursorMove.WordLeft:
                this.cursor.moveWordLeft();
                break;
            case CursorMove.WordRight:
                this.cursor.moveWordRight();
                break;
            case CursorMove.Home:
                this.cursor.moveHome();
                break;
            case CursorMove.End:
                this.cursor.moveEnd();
                break;
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

    removeContent() {
        const [from, to] = this.OrderedCursors;
        const newContent =
            from.element.item.Content.substring(0, from.index) +
            to.element.item.Content.substring(to.index);

        for (let selectionRange of this.getSelectionRanges()) {
            if (selectionRange.element == from.element) continue;
            selectionRange.element.item.Delete();
        }

        from.element.item.Content = newContent;
        from.element.item.Message.State = {
            ...from.element.item.Message.State,
            SubContextURI: to.element.item.Message.State.SubContextURI
        };
        to.to(from);
    }
}

type SelectionRange = {
    element: ItemComponent,
    range: [number, number],
    lines: Array<LineSelectionRange>
}
type LineSelectionRange = {
    number: number;
    range: [number, number];
}