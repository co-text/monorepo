import { EventListener, Fn } from '@cmmn/core'
import { BaseController } from './base.controller'

export class KeyboardController extends BaseController {

    onKeyDown = (event: KeyboardEvent) => {
        const modifiers = ['Alt', 'Ctrl', 'Shift'].filter(x => event[x.toLowerCase() + 'Key'])
        const modKey = modifiers.join('') + event.code
        if (this.item && modKey in this.editorContext.actions) {
            this.editorContext.actions[modKey](this.editorContext)
            event.preventDefault()
        } else {
            console.log(modKey)
        }
    }

    onInput = (e: InputEvent) => {
        // const target = e.target as HTMLItem
        if (!this.focus.cursor) return;
        this.selection.input();
        // const oldText = target.component.item.Content
        // const newText = target.innerText
        // this.selection.removeContent()
        // target.component.item.Message.UpdateContent(newText)
        // this.selection.setFromWindow()
    }

    subscribe() {
        const listener = new EventListener(document)
        return Fn.pipe(
            listener.on('keydown', this.onKeyDown),
            listener.on('input', this.onInput)
        )
    }

}