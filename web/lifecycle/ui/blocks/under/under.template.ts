import { ITemplate } from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    <ul>
        ${state.streams.map(x => html(x.id)`<li>${x.type}:${x.id}</li>`)}
    </ul>
`;

export type IState = {
    streams: Array<{ id: string; type: string }>
}

export type IEvents = {}
