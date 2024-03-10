import {BaseCell} from "@cmmn/cell";
import {EditorContext} from "./types";

export class BaseController {
    constructor(protected editorContext: BaseCell<EditorContext>) {
    }

    protected get element(){
        return this.editorContext.get().element;
    }
    protected get selection(){
        return this.editorContext.get().selection;
    }
}