import { ContextModel, MessageModel } from "@domain";
import { Domain } from "@domain/base/domain";

export * from "./model";
export * from "./domain";
export * from "./infr";
export * from "./sync/contextStore";

export function run() {
    const domain = new Domain(getInstance);

    domain.subscribe();

    function getInstance(id: string) {
        const [contextURI, messageID] = id.split('#');
        if (messageID) {
            return MessageModel.get(messageID, contextURI)
        } else {
            return ContextModel.get(contextURI);
        }
    }
}