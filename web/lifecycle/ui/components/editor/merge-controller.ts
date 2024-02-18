import {Diff} from "./diff";
import {EditorItem, EditorItemCollection} from "./types";
import {bind, Fn} from "@cmmn/core";

export class MergeController {
    constructor(private model: EditorItemCollection, private ui: EditorItemCollection) {
    }
    @bind
    fromModel() {
        try {
            const diff = Diff.get(this.model, this.ui);
            diff.print('from model');
            diff.apply(this.ui)
        }catch (e){
            console.error(e);
            throw e;
        }
    }

    @bind
    fromUI(){
        const diff = Diff.get(this.ui, this.model);
        diff.print('from ui');
        diff.apply(this.model);
    }

    listen() {
        return Fn.pipe(
            this.ui.subscribe(this.fromUI),
            this.model.subscribe(this.fromModel),
        )
    }
}

