import {DomainCollection} from "./domain-collection";
import {MessageItem} from "./message-item";
import {CursorMove} from "./types";
import {TextMeasure} from "./text.measure";
import {SelectionController} from "./selection.controller";

export const KeyboardActions: Record<string, (context: Context) => void> = {
    Tab: ({item}) => item.moveRight(),
    ShiftTab: ({item}) => item.moveLeft(),
    Enter: ({model, item, selection}) => {
        // const text = item.Content.substring(selection.cursor.cursor.index);
        // item.Content = item.Content.substring(0, cursor.cursor.index);
        // model.addAfter(item, text)
    },
    CtrlArrowUp: ({item}) => item.moveUp(),
    CtrlArrowDown: ({item}) => item.moveDown(),
    ShiftArrowLeft: ({selection}) => selection.expand(CursorMove.Left),
    ShiftArrowRight: ({selection}) => selection.expand(CursorMove.Right),
    ArrowLeft: ({selection}) => selection.move(CursorMove.Left),
    ArrowRight: ({selection}) => selection.move(CursorMove.Right),
    CtrlArrowLeft: ({selection}) => selection.move(CursorMove.WordLeft),
    CtrlArrowRight: ({selection}) => selection.move(CursorMove.WordRight),
    CtrlShiftArrowLeft: ({selection}) => selection.expand(CursorMove.WordLeft),
    CtrlShiftArrowRight: ({selection}) => selection.expand(CursorMove.WordRight),
    ArrowUp: ({selection}) => selection.move(CursorMove.Up),
    ArrowDown: ({selection}) => selection.move(CursorMove.Down),
    ShiftArrowUp: ({selection}) => selection.expand(CursorMove.Up),
    ShiftArrowDown: ({selection}) => selection.expand(CursorMove.Down),
    Backspace: ({item, selection, measure}) => {
        // if (cursor.cursor.index == 0){
        //     const prev = item.previous;
        //     cursor.moveLeft();
        //     prev.Content += item.Content;
        //     item.Delete();
        // } else {
        //     item.Content = item.Content.substring(0, cursor.cursor.index - 1) +
        //         item.Content.substring(cursor.cursor.index);
        //     cursor.moveLeft()
        // }
    }
}

type Context = {
    model: DomainCollection,
    item: MessageItem,
    selection: SelectionController,
    event: KeyboardEvent,
    measure: TextMeasure
}