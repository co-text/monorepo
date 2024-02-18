import {DomainCollection} from "./domain-collection";
import {IMessageProxy} from "@proxy";
import { Message }from "@cotext/sdk";
import {EventEmitter} from "@cmmn/core";

export type ContentEditableState = {
    Items: DomainCollection;
}

export type EditorItem = {
    Content: string;
    path: string[];
    level: number;
}

export type EditorItemCollection = Iterable<EditorItem> & {
    add(item: EditorItem, after: EditorItem, before: EditorItem): void;
    moveBefore(before: EditorItem, item: EditorItem): void;
    remove(item: EditorItem): void;
    findItem(item: EditorItem): EditorItem;
    subscribe(callback: () => void): () => void;
};