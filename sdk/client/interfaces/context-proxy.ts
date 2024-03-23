import { Context, Message } from "@model";
import { IMessageProxy } from "./message-proxy";

export interface IContextProxy {
    get State(): Readonly<Context>;

    get Messages(): ReadonlyArray<IMessageProxy>;

    get Parents(): ReadonlyArray<IMessageProxy>;

    RemoveMessage(id: string): void;

    CreateMessage(message: Message, index?: number): IMessageProxy;

    InsertMessage(id: string, index: number): void
}