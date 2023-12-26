import {DomainCollection} from "./domain-collection";
import {Cell} from "@cmmn/cell";
import {DomItemCollection} from "./dom-item-collection";
import {Diff, getDiff, merge} from "./diff";
import {EditorItem} from "./types";

export class CeController {
    public ce = document.createElement('div');
    private ui: DomItemCollection = new DomItemCollection(this.ce);
    constructor(private domain: DomainCollection) {
        this.ce.contentEditable = 'true';
        Cell.OnChange(() => this.fromModel(), () => {});
    }

    fromModel() {
        try {
            console.log(
                Array.from(this.domain).map(x => x?.Content),
                Array.from(this.ui).map(x => x?.Content),
            )
            const diff = getDiff(this.domain, this.ui);
            if (diff.add.length+diff.move.length+diff.remove.length+diff.update.length == 0)
                return;
            printDiff(diff, 'Update UI:')
            merge(diff, this.ui);
        }catch (e){
            console.error(e);
            throw e;
        }
    }

    update(){
        console.log(
            Array.from(this.domain).map(x => x?.Content),
            Array.from(this.ui).map(x => x?.Content),
        )
        const diff = getDiff(this.ui, this.domain);
        if (diff.add.length+diff.move.length+diff.remove.length+diff.update.length == 0)
            return;
        printDiff(diff, 'Update Model:')
        merge(diff, this.domain);
    }
}

function printDiff(diff: Diff<EditorItem>, title: string){
    const table = [
        ...diff.add.map(x => ({type: 'add', from: x.item?.Content, to: x.before?.Content})),
        ...diff.move.map(x => ({type: 'move', from: x.item?.Content, to: x.before?.Content})),
        ...diff.remove.map(x => ({type: 'remove', from: x?.Content, to: ''})),
        ...diff.update.map(x => ({type:'update', from: x.from?.Content, to: x.to?.Content}))
    ];
    if (table.length == 0)
        return;
    console.group(title);
    console.table(table);
    console.groupEnd();
}
