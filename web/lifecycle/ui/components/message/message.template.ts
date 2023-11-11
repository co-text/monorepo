import {ITemplate} from "@cmmn/ui";
import {Message} from "@cotext/sdk";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    <input value=${state.message.Content} 
           placeholder="Task text">
`;

export type IState = {
    message: Message
};

export type IEvents = {}
