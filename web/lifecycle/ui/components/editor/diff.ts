import {EditorItem, EditorItemCollection} from "./types";

export function getDiff(from: EditorItemCollection, to: EditorItemCollection): Diff<EditorItem>{
    const diff: Diff<EditorItem> = {update: [], add: [], move: [], remove: []};
    const iterator = to[Symbol.iterator]();
    let current = iterator.next();
    for (let item of from) {
        if (!current.done && current.value.id == item.id){
            if (item.Content !== current.value?.Content)
                diff.update.push({from: item, to: current.value});
            current = iterator.next();
        } else {
            const existed = to.findItem(item);
            if (existed){
                diff.move.push({item: existed, before: current.value});
            } else {
                diff.add.push({item, before: current.value});
            }
        }
    }
    const movedIds = new Set(diff.move.map(x => x.item.id));
    while (!current.done) {
        if (!movedIds.has(current.value.id)) {
            diff.remove.push(current.value);
        }
        current = iterator.next();
    }
    return diff;
}

export function merge(diff: Diff<EditorItem>, to: EditorItemCollection){
    for (let x of diff.add) {
        to.addBefore(x.before, x.item);
    }
    for (let x of diff.update) {
        x.to.Content = x.from.Content;
    }
    for (let x of diff.move) {
        to.moveBefore(x.before, x.item);
    }
    for (let x of diff.remove) {
        to.remove(x);
    }
    return diff;
}

export type Diff<T> = {
    update: Array<{from: T, to: T}>;
    move: Array<{item: T, before: T | undefined}>;
    add: Array<{item: T, before: T | undefined}>;
    remove: Array<T>;
}