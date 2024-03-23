import { ITemplate } from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) =>
    html`
        ${state.uri ? html(state.uri)`<ctx-div-editor uri=${state.uri}/>` : null}
    `;

export type IState = {
    uri: string;
}

export type IEvents = {}
