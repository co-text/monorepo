import {SelectionController} from "./selection.controller";
import {ItemComponent} from "./item.component";
import {ExtendedElement} from "@cmmn/ui";
import {bind, EventListener, Fn} from "@cmmn/core";

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
    focus: ItemComponent | undefined;
    @bind
    onPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        this.element.setPointerCapture(event.pointerId);
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.history.unshift(event);
        this.selection.anchor.moveToPoint(target, point);
        this.selection.cursor.to(this.selection.anchor);
        this.isPointerDown = true;
        target.element.focus();
        this.focus = target;
    }

    @bind
    onPointerMove(event: PointerEvent) {
        if (event.button !== 0) return;
        if (!this.isPointerDown) return;
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.selection.cursor.moveToPoint(target, point);
        target.element.focus();
        this.focus = target;
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
        target.element.focus();
        this.focus = target;
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
        const children = content.children;
        function binarySearch(left: number, right: number): ItemComponent{
            if (left == right) return null;
            const middle = Math.floor((left + right) / 2);
            const item = children.item(middle) as ExtendedElement<ItemComponent>;
            const rect = item.component.BoundingRect;
            if (event.pageY >= rect.top){
                if (event.pageY <= rect.bottom)
                    return item.component;
                return binarySearch(middle + 1, right);
            }
            return binarySearch(left, middle);
        }
        const element = binarySearch(0, children.length);
        if (!element) return [];
        return [element, {
            x: event.pageX - element.BoundingRect.x,
            y: event.pageY - element.BoundingRect.y,
        }]
    }
}