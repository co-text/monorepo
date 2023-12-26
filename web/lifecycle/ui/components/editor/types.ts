import {DomainCollection} from "./domain-collection";
import {IMessageProxy} from "@proxy";
import { Message }from "@cotext/sdk";

export type ContentEditableState = {
    Items: DomainCollection;
}

export type EditorItem = {
    Content: string;
    id: string;
}

export type EditorItemCollection = Iterable<EditorItem> & {
    addBefore(before: EditorItem, item: EditorItem): void;
    moveBefore(before: EditorItem, item: EditorItem): void;
    remove(item: EditorItem): void;
    findItem(item: EditorItem): EditorItem
};