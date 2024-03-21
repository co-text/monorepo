import {Message} from "@model";
import type {IContextProxy} from "./context-proxy";

export interface IMessageProxy {
    readonly id: string;
    get State(): Readonly<Message>;
    // Context: IContextProxy;
    get SubContext(): IContextProxy | null;

    GetOrCreateSubContext(): IContextProxy;

    AddMessage(message: Message, index?: number): IMessageProxy;

    Move(from: IContextProxy, context: IContextProxy, index: number): IMessageProxy;

    UpdateContent(content: string): void;

    Merge(message: IMessageProxy): void;
}
