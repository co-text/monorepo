import {cell} from "@cmmn/cell";
import {MessageJSON} from "@domain";
import {Message} from "@model";
import {ContextStore} from "./contextStore";

export class MessageStore {
    constructor(private contextStore: ContextStore, private id: string) {
        // activate sync
        this.json.on('change', (e) => {
        });
    }

    @cell
    private json = this.contextStore.getObjectCell<MessageJSON>(this.id);

    public get State() {
        return Message.FromJSON(this.json.Value)
    }

    public set State(message: Message) {
        this.json.Diff(Message.ToJSON(message))
    }

    public dispose(){
        this.json.dispose();
    }
}