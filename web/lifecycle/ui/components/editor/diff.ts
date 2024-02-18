import {EditorItem, EditorItemCollection} from "./types";

export class Diff<T extends EditorItem> {
    private readonly update: Array<{from: T, to: T}> = [];
    private readonly move: Array<{item: T, before: T | undefined, after: T | undefined}> = [];
    private readonly add: Array<{item: T, before: T | undefined, after: T | undefined}> = [];
    private readonly remove: Array<T> = [];

    static get(from: EditorItemCollection, to: EditorItemCollection){
        const diff = new Diff();
        const iterator = to[Symbol.iterator]();
        let prev: EditorItem = null;
        let current = iterator.next();
        for (let item of from) {
            if (!current.done && current.value.path.at(-1) == item.path.at(-1)){
                if (item.Content !== current.value?.Content)
                    diff.update.push({from: item, to: current.value});
                prev = current.value;
                current = iterator.next();
            } else {
                const existed = to.findItem(item);
                if (existed){
                    diff.move.push({item: existed, before: current.value, after: prev});
                } else {
                    diff.add.push({item, before: current.value, after: prev});
                    prev = item;
                }
            }
        }
        const movedIds = new Set(diff.move.map(x => x.item.path.join(':')));
        while (!current.done) {
            if (!movedIds.has(current.value.path.join(':'))) {
                diff.remove.push(current.value);
            }
            current = iterator.next();
        }
        return diff;
    }

    apply(to: EditorItemCollection){
        for (let x of this.add) {
            to.add(x.item, x.after, x.before);
        }
        for (let x of this.update) {
            x.to.Content = x.from.Content;
        }
        for (let x of this.move) {
            to.moveBefore(x.before, x.item);
        }
        for (let x of this.remove) {
            to.remove(x);
        }
        return this;
    }

    print(title: string){
        if (this.add.length+this.move.length+this.remove.length+this.update.length == 0)
            return;
        const table = [
            ...this.add.map(x => ({type: 'add', from: x.item?.Content, to: x.before?.Content})),
            ...this.move.map(x => ({type: 'move', from: x.item?.Content, to: x.before?.Content})),
            ...this.remove.map(x => ({type: 'remove', from: x?.Content, to: ''})),
            ...this.update.map(x => ({type:'update', from: x.from?.Content, to: x.to?.Content}))
        ];
        if (table.length == 0)
            return;
        console.groupCollapsed(title);
        console.table(table);
        console.groupEnd();
    }
}