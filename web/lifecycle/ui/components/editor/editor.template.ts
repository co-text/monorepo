import { ITemplate } from "@cmmn/ui";
import {EditorItem} from "./types";

export const template: ITemplate<IState, IEvents> = (html,state, events) => {
    return html`${state.Element}`;
};

export type IState = {
    Element: HTMLDivElement;
    Items: EditorItem[];
}
export type IEvents = {

}