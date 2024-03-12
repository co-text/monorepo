import {ItemComponent} from "./item.component";
import {ExtendedElement} from "@cmmn/ui";
import {bind, EventListener, Fn} from "@cmmn/core";
import {BaseController} from "./base.controller";

export class PointerController extends BaseController{
    get listenTarget(){
        return this.element.querySelector('.container');
    }

    public subscribe(){
        const listener = new EventListener(this.listenTarget);
        return Fn.pipe(
            listener.on("pointerdown", this.onPointerDown),
            listener.on("pointerup", this.onPointerUp),
            listener.on("pointermove", this.onPointerMove),
        )
    }

    private isPointerDown = false;
    private history: Array<PointerEvent> = [];
    @bind
    onPointerDown(event: PointerEvent) {
        if (event.button !== 0) return;
        event.preventDefault();
        this.listenTarget.setPointerCapture(event.pointerId);
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.history.unshift(event);
        this.focus.moveToPoint(target, point);
        if (!event.shiftKey) {
            this.anchor.to(this.focus);
        }
        target.focus();
        this.isPointerDown = true;
    }

    @bind
    onPointerMove(event: PointerEvent) {
        if (!this.isPointerDown) return;
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.focus.moveToPoint(target, point);
        target.focus();
    }

    @bind
    onPointerUp(event: PointerEvent) {
        if (event.button !== 0) return;
        event.preventDefault();
        this.listenTarget.releasePointerCapture(event.pointerId);
        this.isPointerDown = false;
        const [target, point] = this.getRelativePoint(event);
        if (!target) return;
        this.history.unshift(event);
        const clickCount = this.getClickCount();
        switch (clickCount) {
            case 1: this.focus.moveToPoint(target, point); break;
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
        const children = content.children as HTMLCollectionOf<ExtendedElement<ItemComponent>>;
        const pointerMissThreshold = 5;
        function binarySearch(left: number, right: number): ItemComponent{
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
        if (children.length == 0)
            return [];
        const lastElement = children.item(children.length - 1).component;
        if (point.y > lastElement.BoundingRect.top - pointerMissThreshold){
            return [
                lastElement, {
                    x: point.x - lastElement.BoundingRect.x,
                    y: point.y - lastElement.BoundingRect.y,
                }
            ]
        }
        const element = binarySearch(0, children.length);
        if (!element) return [];
        return [element, {
            x: point.x - element.BoundingRect.x,
            y: point.y - element.BoundingRect.y,
        }]
    }
}
