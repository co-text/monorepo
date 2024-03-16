import {ITemplate} from "@cmmn/ui";

export const template: ITemplate<IState, IEvents> = (html, state, events) =>
    state.user ? html`
<!--            <app-header/>-->
            ${state.uri ? html(state.uri)`<ctx-div-editor uri=${state.uri}/>` : null}
<!--            <app-main/>-->
<!--            <app-under/>-->
<!--            <app-result/>-->
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
