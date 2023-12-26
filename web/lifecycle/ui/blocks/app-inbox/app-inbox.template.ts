import {ITemplate, html as globalHtml} from "@cmmn/ui";
import {IMessageProxy, MessageProxy} from "@proxy";

export const template: ITemplate<IState, IEvents> = (html, state, events) => html`
    <ctx-editor uri="inbox"/>
`;

export type IState = {
    messages: ReadonlyArray<IMessageProxy>
}

export type IEvents = {
    add();
    take(id: string);
}


