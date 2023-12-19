import {ITemplate} from "@cmmn/ui";
import type {Message} from "@cotext/sdk";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    <div>
        <input id=${state.message.id}
               .value=${state.message.Content} 
               placeholder="Task text">
        ${state.message.Content}
        ${state.message.id}
    </div>
`;

export type IState = {
    message: Message
};

export type IEvents = {}
