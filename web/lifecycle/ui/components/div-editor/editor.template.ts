import { ITemplate } from "@cmmn/ui";
import {MessageItem} from "./message-item";
import {SelectionBlock} from "./types";

export const template: ITemplate<IState, IEvents> = (html,state, events) => {
    return html`
        ${state.Cursor ? html('cursor')`
                <div class="cursor" style=${{'--x': state.Cursor.x, '--y': state.Cursor.y}}/>
            ` : null}
        ${state.Selection.map((s, i) => html(`selection${s.id}`)`
                <div class="selection-block" style=${{'--x': s.x, '--y': s.y, '--width': s.width}}/>
            `)}
        <div class="content">
            ${state.Items.map(((item, index) => html(item.id)`
                <ctx-editor-item id=${item.id} index=${index} item=${item} style=${{ '--level': item.level }}/>
            `))}
        </div>
    `;
};

export type IState = {
    Items: MessageItem[];
    Cursor: {y: string; x: number;};
    Anchor: {y: string; x: number;};
    Selection: Array<SelectionBlock>
}
export type IEvents = {
    pasteText(text);
    fromModel();
    fromUI();
}