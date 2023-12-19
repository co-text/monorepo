import {ITemplate, html as globalHtml} from "@cmmn/ui";
import {IMessageProxy, MessageProxy} from "@proxy";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.messages.map(x => html(x.State.id)`<div flex="row">
        ${globalHtml.for(MessageProxy, x.State.id)`<app-message flex-1 message=${x}></app-message>`}
        <button .message=${x.State} onclick=${events.take(e => e.target.message.id)}>-></button>
    </div>`)}
    <button class="add" onclick=${events.add()}>add</button>
`;

export type IState = {
    messages: ReadonlyArray<IMessageProxy>
}

export type IEvents = {
    add();
    take(id: string);
}


