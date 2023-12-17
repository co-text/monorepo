import { ModelLike } from "@cmmn/domain/worker";
import {ITemplate, html as globalHtml} from "@cmmn/ui";
import {IMessageActions, Message} from "@cotext/sdk";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    ${state.messages.map(x => html(x.State.id)`<div flex="row">
        ${globalHtml.for(Message, x.State.id)`<app-message flex-1 message=${x}></app-message>`}
        <button .message=${x.State} onclick=${events.take(e => e.target.message.id)}>-></button>
    </div>`)}
    <button class="add" onclick=${events.add()}>add</button>
    <dialog>
        Input text
        <form method="dialog">
            <button>Закрыть</button>
        </form>
    </dialog>
`;

export type IState = {
    messages: ModelLike<Message, IMessageActions>[]
}

export type IEvents = {
    add();
    take(id: string);
}


