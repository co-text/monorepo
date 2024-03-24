import { utc } from "@cmmn/core";
import { User } from "./user";
import type { MessageJSON } from "@domain";

export class Message {
    public Content: string;
    // public Description?: string;
    // public Author?: User;
    // public CreatedAt: Date;
    // public UpdatedAt: Date;
    // public ContextURI: string | undefined;
    // public URI: string;
    public SubContextURI: string | undefined;
    // public Action?: string;
    public id: string;

    // public equals?(m: Message): boolean;

    // static isLast(message: Message) {
    //     return message.Context.Messages[message.Context.Messages.length - 1].id == message.id;
    // }

    // static equals(message1: Message, message2: Message): boolean {
    //     if (!message2 && message1 || !message1 && message2)
    //         return false;
    //     if (message2.id !== message1.id)
    //         return false;
    //     return +message2.UpdatedAt == +message1.UpdatedAt;
    // }

    static FromJSON(m: MessageJSON): Message {
        return Object.assign(new Message(), {
            Content: m.Content,
            // Description: m.Description,
            // CreatedAt: utc(m.CreatedAt),
            // UpdatedAt: utc(m.UpdatedAt),
            id: m.id,
            // URI: m.URI,
            // ContextURI: m.ContextURI,
            SubContextURI: m.SubContextURI,
        });
    }

    static ToJSON(m: Partial<Message>): Partial<MessageJSON> {
        return {
            ...m,
        };
    }
}
