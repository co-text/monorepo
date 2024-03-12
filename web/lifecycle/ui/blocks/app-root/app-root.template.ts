import {ITemplate} from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) =>
    state.user ? html`
        <app-layout>
<!--            <app-header/>-->
            <ctx-div-editor uri=${state.uri}/>
<!--            <app-main/>-->
<!--            <app-under/>-->
<!--            <app-result/>-->
        </app-layout>
    ` : html`
        <input onchange=${events.setUser(e => e.target.value)}>
    `;

export type IState = {
    uri: string;
    user: string
}

export type IEvents = {
    setUser(user: string): void;
}
