import {ITemplate, html as globalHtml} from "@cmmn/ui";
import type {IMessageActions, Message} from "@cotext/sdk";
import {ModelLike} from "@cmmn/domain/worker";
import {IMessageProxy, MessageProxy} from "@proxy";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.messages.map(x => html(x.State.id)`<div flex="row">
        ${globalHtml.for(MessageProxy, x.State.id)`<app-message flex-1 message=${x}></app-message>`}
    </div>`)}
`;

export type IState = {
    readonly messages: ReadonlyArray<IMessageProxy>
}

export type IEvents = {}
