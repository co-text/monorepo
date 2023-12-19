import {ITemplate} from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) =>
    state.user ? html`
        <app-layout>
            <app-header/>
            <app-inbox/>
<!--            <app-main/>-->
            <app-under/>
            <app-result/>
        </app-layout>
    ` : html`
        <input onchange=${events.setUser(e => e.target.value)}>
    `;

export type IState = {
    user: string;
}

export type IEvents = {
    setUser(user: string): void;
}
