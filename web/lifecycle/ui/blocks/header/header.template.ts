import { ITemplate } from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    Hi, ${state.user}!
`;

export type IState = {
    user: string;
}

export type IEvents = {}
