import {MessageItem} from "./message-item";
import {DomainCollection} from "./domain-collection";
import {SelectionController} from "./selection.controller";
import {TextMeasure} from "./text.measure";
import {ExtendedElement} from "@cmmn/ui";
import {DivEditorComponent} from "./editor.component";
import {ItemComponent} from "./item.component";
import { CursorController } from './cursor.controller'
import { ActionsController } from './actions.controller'

export type Cursor = {
    item: MessageItem;
    index: number;
    x: number;
    line: number;
}

export enum CursorMove {
    Left,
    WordLeft,
    Right,
    WordRight,
    Up,
    Down,
    End,
    Home
}

export type SelectionBlock = {
    id: string;
    y: string;
    x: number;
    width: number;
    text: string;
    level: number;
}
export type Point = {x: number, y: number;}

export type EditorContext = {
    actions: ActionsController;
    anchor: CursorController;
    focus: CursorController;
    element: ExtendedElement<DivEditorComponent>;
    model: DomainCollection,
    item: MessageItem,
    selection: SelectionController,
    measure: TextMeasure,
    items: MessageItem[];
}

export type HTMLItem = ExtendedElement<ItemComponent> & HTMLDivElement;
