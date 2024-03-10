import {BaseCell} from "@cmmn/cell";
import {EditorContext, HTMLItem} from "./types";
import {KeyboardActions} from "./keyboard.actions";
import {EventListener, Fn} from "@cmmn/core";
import {BaseController} from "./base.controller";

export class KeyboardController extends BaseController{

    onKeyDown = (event: KeyboardEvent) => {
        const modifiers = ['Alt', 'Ctrl', 'Shift'].filter(x => event[x.toLowerCase() + 'Key']);
        const modKey = modifiers.join('') + event.code;
        if (modKey in KeyboardActions){
            KeyboardActions[modKey](this.editorContext.get());
            event.preventDefault();
        } else {
            console.log(modKey);
        }
    }

    onInput = (e: InputEvent) => {
        const target = e.target as HTMLItem;
        if (!this.selection.cursor.cursor) return;
        const oldText = target.component.item.Content;
        const newText = target.innerText;
        target.component.item.Message.UpdateContent(newText);
        this.editorContext.get().selection.removeContent();
        this.editorContext.get().selection.setFromWindow();
    }

    subscribe() {
        const listener = new EventListener(document);
        return Fn.pipe(
            listener.on('keydown', this.onKeyDown),
            listener.on('input', this.onInput)
        );
    }
}