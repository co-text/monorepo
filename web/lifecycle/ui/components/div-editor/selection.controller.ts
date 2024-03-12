import {CursorController} from "./cursor.controller";
import { CursorMove, EditorContext, Point, SelectionBlock } from './types'
import { BaseCell, Cell } from '@cmmn/cell'
import {ExtendedElement} from "@cmmn/ui";
import {ItemComponent} from "./item.component";
import {node} from "@cotext/server/p2p";
import { BaseController } from './base.controller'

export class SelectionController extends BaseController{

    constructor(editorContext: EditorContext) {
        super(editorContext);
        Cell.OnChange(() => this.Blocks, e => {
            const selection = getSelection();
            try {
                if (this.anchor.element && this.focus.element) {
                    selection.setBaseAndExtent(
                        this.anchor.node,
                        this.anchor.lineIndex,
                        this.focus.node,
                        this.focus.lineIndex,
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
        function getItemComponent(node: Node){
            if (node.parentElement instanceof HTMLSpanElement)
                return node.parentElement.parentElement;
            return node.parentElement;
        }
        const anchor = getItemComponent(selection.anchorNode);
        this.anchor.itemId = anchor.id;
        this.anchor.lineIndex = selection.anchorOffset;

        const cursor = getItemComponent(selection.focusNode);
        this.focus.itemId = cursor.id;
        this.focus.lineIndex = selection.focusOffset;
    }

    get isEmpty(): boolean {
        return this.focus.element === this.anchor.element && this.focus.index == this.anchor.index;
    }

    get isOneItem() {
        return this.anchor.element == this.focus.element;
    }

    get isOneLine() {
        return this.isOneItem && this.anchor.lineNumber == this.focus.lineNumber;
    }

    public get Blocks(): Array<SelectionBlock> {
        if (!this.focus.element || !this.anchor.element)
            return [];
        return Array.from(this.getBlocks())
    }

    private get orderedCursors(): [CursorController, CursorController] {
        if (this.isOneItem){
            return this.anchor.index > this.focus.index
                ? [this.focus, this.anchor]
                : [this.anchor, this.focus]
        }
        const anchorPosition = this.anchor.element.BoundingRect;
        const cursorPosition = this.focus.element.BoundingRect;
        return anchorPosition.y < cursorPosition.y
            ? [this.anchor, this.focus]
            : [this.focus, this.anchor];
    }

    private* getSelectionRanges(): Generator<SelectionRange> {
        const [from, to] = this.orderedCursors;

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
        this.anchor.to(this.focus);
    }

    expand(type: CursorMove) {
        switch (type) {
            case CursorMove.Down:
                this.focus.moveDown();
                break;
            case CursorMove.Up:
                this.focus.moveUp();
                break;
            case CursorMove.Left:
                this.focus.moveLeft();
                break;
            case CursorMove.Right:
                this.focus.moveRight();
                break;
            case CursorMove.WordLeft:
                this.focus.moveWordLeft();
                break;
            case CursorMove.WordRight:
                this.focus.moveWordRight();
                break;
            case CursorMove.Home:
                this.focus.moveHome();
                break;
            case CursorMove.End:
                this.focus.moveEnd();
                break;
        }
    }

    selectTarget(target: ItemComponent) {
        this.anchor.itemId = target.item.id;
        this.anchor.index = 0;
        this.focus.itemId = target.item.id;
        this.focus.index = target.item.Content.length;
    }

    selectCurrentWord(target: ItemComponent, point: Point) {
        this.focus.moveToPoint(target, point);
        this.focus.moveWordRight();
        this.anchor.to(this.focus);
        this.anchor.moveWordLeft();
    }

    removeContent(newContent = null) {
        const [from, to] = this.orderedCursors;
        newContent ??=
            from.element.item.Content.substring(0, from.index) +
            to.element.item.Content.substring(to.index);

        for (let selectionRange of this.getSelectionRanges()) {
            if (selectionRange.element == from.element) continue;
            selectionRange.element.item.Delete();
        }

        from.element.item.Content = newContent;
        from.element.item.Message.Merge(to.element.item.Message);
        to.to(from);
    }

    insert (lines: string[]) {
        this.removeContent();

        if (lines.length > 1) {
            let item =this.domain.addBefore(this.focus.element.item,
              this.focus.element.item.Content.slice(0, this.focus.index) +
                lines.shift().trim()
            );
            let level = 0;
            function setItem(line: string){
                const tabCount = line.match(/^\t*/)[0].length;
                while (level > tabCount) {
                    item = item.parent;
                    level--;
                }
                if (level < tabCount){
                    level++;
                    item.Message.GetOrCreateSubContext();
                }
            }
            for (let line of lines.slice(0, -1)) {
                setItem(line);
                item = this.domain.addAfter(item, line.trim());
            }
            const lastLine = lines.pop();
            setItem(lastLine);
            this.focus.element.item.Message.UpdateContent(
              lastLine.trim()+
              this.focus.element.item.Content.slice(this.focus.index)
            );
            const index = item.Message.SubContext ? 0 : item.index + 1;
            this.focus.element.item.Message.Move(
              this.focus.element.item.context,
              item.Message.SubContext ?? item.context,
              index
            );
        }else {
            this.focus.element.item.Message.UpdateContent(
              this.focus.element.item.Content.slice(0, this.focus.index) +
              lines[0] +
              this.focus.element.item.Content.slice(this.focus.index)
            )
        }
    }

    input () {
        if (this.isOneItem){
            this.focus.element.item.Content = this.focus.element.element.innerText;
        } else {
            const [from, to] = this.orderedCursors;
            const [fromA, fromB] = from.contentParts;
            const [toA, toB] = to.contentParts;
            const fromText = from.element.element.innerText;
            let inputText = fromText.substring(from.index);
            if (inputText == fromB){
                inputText = to.element.element.innerText.substring(0, to.element.element.innerText.length
                  -(to.element.item.Content.length - to.index));
            }
            this.removeContent( fromA + inputText + toB);
        }
        this.setFromWindow();
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