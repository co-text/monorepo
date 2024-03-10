import {EditorContext, CursorMove} from "./types";
import {Fn} from "@cmmn/core";

export const KeyboardActions: Record<string, (context: EditorContext) => void> = {
    Tab: ({item, selection}) => {
        selection.anchor.itemId = selection.cursor.itemId = item.moveRight();
    },
    ShiftTab: ({item, selection}) => {
        selection.anchor.itemId = selection.cursor.itemId = item.moveLeft();
    },
    Enter: ({model, item, selection}) => {
        const text = item.Content.substring(selection.cursor.index);
        item.Content = item.Content.substring(0, selection.cursor.index);
        selection.cursor.itemId = selection.anchor.itemId = model.addAfter(item, text);
        selection.cursor.index = selection.anchor.index = 0;
    },
    CtrlKeyV: async ({selection}) => {
        for (const item of await navigator.clipboard.read()){
            const text = await item.getType('text/plain');
            selection.cursor.element.item.Message.UpdateContent(
                selection.cursor.element.item.Content.slice(0, selection.cursor.index) +
                await text.text() +
                selection.cursor.element.item.Content.slice(selection.cursor.index)
            )
        }
    },
    CtrlKeyC: async ({ selection}) => {
        const isEmpty = selection.isEmpty;
        const oldPosition = selection.cursor.index;
        if (isEmpty){
            selection.selectTarget(selection.cursor.element);
        }
        const minLevel = Math.min(...selection.Blocks.map(x => x.level));
        const text = selection.Blocks.map(x => Array(x.level - minLevel).fill('\t').join('') + x.text).join('\n');
        await navigator.clipboard.writeText(text);
        await Fn.asyncDelay(100);
        if (isEmpty){
            selection.cursor.index = oldPosition;
            selection.anchor.index = oldPosition;
        }
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
    End: ({selection}) => selection.move(CursorMove.End),
    Home: ({selection}) => selection.move(CursorMove.Home),
    ShiftEnd: ({selection}) => selection.expand(CursorMove.End),
    ShiftHome: ({selection}) => selection.expand(CursorMove.Home),
    Backspace: ({item, selection}) => {
        if (selection.isEmpty){
            selection.cursor.moveLeft();
        }
        selection.removeContent();
    },
    Delete: ({item, selection}) => {
        if (selection.isEmpty){
            selection.cursor.moveRight();
        }
        selection.removeContent();
    },
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

