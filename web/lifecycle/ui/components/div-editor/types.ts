import {MessageItem} from "./message-item";

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