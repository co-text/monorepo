import { ITemplate } from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.children}
`;

export type IState = {
    children: Element[]
}

export type IEvents = {}
