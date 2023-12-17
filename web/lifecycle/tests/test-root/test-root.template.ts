import {ITemplate} from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.nodesCount}
`;

export type IState = {
    nodesCount: number;
}

export type IEvents = {
    nodesCountTest(): void;
}
