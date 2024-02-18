import { ITemplate } from "@cmmn/ui";
import {EditorItem} from "./types";

export const template: ITemplate<IState, IEvents> = (html,state, events) => {
    return html`
        <button onclick=${events.pasteText()}>Paste</button>
        <pre contenteditable></pre>
        <button onclick=${events.fromModel()}>fromModel</button>
        <button onclick=${events.fromUI()}>fromUI</button>
    `;
};

export type IState = {
    Items: EditorItem[];
}
export type IEvents = {
    pasteText(text);
    fromModel();
    fromUI();
}