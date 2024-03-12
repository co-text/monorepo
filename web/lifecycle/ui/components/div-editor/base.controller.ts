import {EditorContext} from "./types";

export class BaseController {
    constructor(protected editorContext: EditorContext) {
    }

    protected get element(){
        return this.editorContext.element;
    }
    protected get selection(){
        return this.editorContext.selection;
    }
    protected get anchor(){
        return this.editorContext.anchor;
    }
    protected get item(){
        return this.editorContext.item;
    }
    protected get focus(){
        return this.editorContext.focus;
    }
    protected get domain(){
        return this.editorContext.model;
    }
}