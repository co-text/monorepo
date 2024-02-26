import {SelectionController} from "./selection.controller";
import {ItemComponent} from "./item.component";
import {ExtendedElement} from "@cmmn/ui";
import {bind, EventListener, Fn} from "@cmmn/core";
import {cell} from "@cmmn/cell";
import {Point} from "./types";

export class PointerController {
    constructor(private element: HTMLElement, private selection: SelectionController) {
    }

    private listener = new EventListener(this.element);

    public subscribe(){
        return Fn.pipe(
            this.listener.on("pointerdown", this.onPointerDown),
            this.listener.on("pointerup", this.onPointerUp),
            this.listener.on("pointermove", this.onPointerMove),
        )
    }

    private isPointerDown = false;
    private history: Array<PointerEvent> = [];
    @bind
    onPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        this.element.setPointerCapture(event.pointerId);
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.history.unshift(event);
        this.selection.cursor.moveToPoint(target, point);
        if (!event.shiftKey) {
            this.selection.anchor.to(this.selection.cursor);
        }
        target.element.focus();
        this.isPointerDown = true;
    }

    @bind
    onPointerMove(event: PointerEvent) {
        if (!this.isPointerDown) return;
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.selection.cursor.moveToPoint(target, point);
        target.element.focus();
    }

    @bind
    onPointerUp(event: PointerEvent) {
        if (event.button !== 0) return;
        this.element.releasePointerCapture(event.pointerId);
        this.isPointerDown = false;
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.history.unshift(event);
        const clickCount = this.getClickCount();
        switch (clickCount) {
            case 1: this.selection.cursor.moveToPoint(target, point); break;
            case 2: this.selection.selectCurrentWord(target, point); break;
            case 3: this.selection.selectTarget(target); break;
        }
        target.focus();
    }

    private dblClickThreshold = 200;
    private getClickCount(){
        const [
            oneUp, oneDown,
            twoUp, twoDown,
            threeUp, threeDown,
        ] = this.history.slice(0, 6);
        if (!twoUp || (oneUp.timeStamp -  twoUp.timeStamp) > this.dblClickThreshold)
            return 1;
        if (!threeUp || (twoUp.timeStamp -  threeUp.timeStamp) > this.dblClickThreshold)
            return 2;
        return 3;
    }

    private getRelativePoint(event: PointerEvent): [ItemComponent, {x: number, y: number}] | []{
        const content = this.element.querySelector('.content');
        const point = {
            x: event.pageX,
            y: event.pageY + content.parentElement.scrollTop
        }
        const children = content.children;
        function binarySearch(left: number, right: number): ItemComponent{
            const pointerMissThreshold = 5;
            if (left == right) return null;
            const middle = Math.floor((left + right) / 2);
            const item = children.item(middle) as ExtendedElement<ItemComponent>;
            const rect = item.component.BoundingRect;
            if (point.y >= rect.top - pointerMissThreshold){
                if (point.y <= rect.bottom + pointerMissThreshold)
                    return item.component;
                return binarySearch(middle + 1, right);
            }
            return binarySearch(left, middle);
        }
        const element = binarySearch(0, children.length);
        if (!element) return [];
        return [element, {
            x: point.x - element.BoundingRect.x,
            y: point.y - element.BoundingRect.y,
        }]
    }
}
