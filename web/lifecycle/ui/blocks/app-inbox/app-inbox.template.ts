import { ITemplate } from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    <ctx-editor uri=${state.uri}/>
`;

export type IState = {
    uri: string
}

export type IEvents = {}


