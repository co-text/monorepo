import { CursorMove } from './types'
import { Fn } from '@cmmn/core'
import { BaseController } from './base.controller'
import { Message } from '@cotext/sdk'

export class ActionsController extends BaseController {
  Tab () {
    this.anchor.itemId = this.focus.itemId = this.item.moveRight()
  }

  ShiftTab () {
    this.anchor.itemId = this.focus.itemId = this.item.moveLeft()
  }

  Enter () {
    if (!this.item) return;
    this.domain.addBefore(this.item, this.item.Content.substring(0, this.focus.index));
    this.item.Content = this.item.Content.substring(this.focus.index);
    this.focus.index = this.anchor.index = 0
  }

  async CtrlKeyV () {
    const lines = [] as string[]
    for (const item of await navigator.clipboard.read()) {
      const text = await (await item.getType('text/plain')).text()
      if (text.startsWith('context://')){
        const message = JSON.parse(text.substring('context://'.length));
        this.focus.item.context.CreateMessage(Message.FromJSON(message), this.focus.item.index + 1);
      } else {
        lines.push(...text.split('\n'));
      }
    }
    if (lines.length) {
      this.selection.insert(lines);
    }
  }

  async CtrlKeyC () {
    const isEmpty = this.selection.isEmpty
    if (isEmpty) {
      const oldPosition = this.focus.index
      this.selection.selectTarget(this.focus.element);
      await navigator.clipboard.writeText('context://' + JSON.stringify(
        Message.ToJSON(this.focus.item.Message.State)
      ));
      await Fn.asyncDelay(100);
      if (isEmpty) {
        this.focus.index = oldPosition
        this.anchor.index = oldPosition
      }
      return;
    }
    const minLevel = Math.min(...this.selection.Blocks.map(x => x.level))
    const text = this.selection.Blocks.map(x => Array(x.level - minLevel).fill('\t').join('') + x.text).join('\n')
    await navigator.clipboard.writeText(text)
  }

  CtrlArrowUp () { this.item.moveUp() }

  CtrlArrowDown () { this.item.moveDown() }

  ShiftArrowLeft () { this.selection.expand(CursorMove.Left) }

  ShiftArrowRight () { this.selection.expand(CursorMove.Right) }

  ArrowLeft () { this.selection.move(CursorMove.Left) }

  ArrowRight () { this.selection.move(CursorMove.Right) }

  CtrlArrowLeft () { this.selection.move(CursorMove.WordLeft) }

  CtrlArrowRight () { this.selection.move(CursorMove.WordRight) }

  CtrlShiftArrowLeft () { this.selection.expand(CursorMove.WordLeft) }

  CtrlShiftArrowRight () { this.selection.expand(CursorMove.WordRight) }

  ArrowUp () { this.selection.move(CursorMove.Up) }

  ArrowDown () { this.selection.move(CursorMove.Down) }

  ShiftArrowUp () { this.selection.expand(CursorMove.Up) }

  ShiftArrowDown () { this.selection.expand(CursorMove.Down) }

  End () { this.selection.move(CursorMove.End) }

  Home () { this.selection.move(CursorMove.Home) }

  ShiftEnd () { this.selection.expand(CursorMove.End) }

  ShiftHome () { this.selection.expand(CursorMove.Home) }

  Backspace () {
    if (this.selection.isEmpty) {
      this.anchor.moveLeft()
    }
    this.selection.removeContent()
  }

  Delete () {
    if (this.selection.isEmpty) {
      this.focus.moveRight()
    }
    this.selection.removeContent()
  }

  CtrlPeriod(){
    this.item.IsOpened = !this.item.IsOpened;
  }
  CtrlKeyA(){
    this.anchor.itemId = this.editorContext.items[0].id
    this.anchor.index = 0;
    this.focus.itemId = this.editorContext.items.at(-1).id
    this.focus.index = this.focus.item.Content.length;
  }
}