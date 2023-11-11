import { ModelLike } from "@cmmn/domain/worker";
import {ITemplate} from "@cmmn/ui";
import {IMessageActions, Message} from "@cotext/sdk";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.messages.map(x => html(x.State.id)`<app-message message=${x}></app-message>`)}
    <button class="add" onclick=${events.add()}>add</button>
`;

export type IState = {
    messages: ModelLike<Message, IMessageActions>[]
}

export type IEvents = {
    add();
}
