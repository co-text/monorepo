import {ITemplate, html as globalHtml} from "@cmmn/ui";
import {IMessageActions, Message} from "@cotext/sdk";
import {ModelLike} from "@cmmn/domain/worker";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.messages.map(x => html(x.State.id)`<div flex="row">
        ${globalHtml.for(Message, x.State.id)`<app-message flex-1 message=${x}></app-message>`}
    </div>`)}
`;

export type IState = {
    messages: Array<ModelLike<Message, IMessageActions>>
}

export type IEvents = {}
