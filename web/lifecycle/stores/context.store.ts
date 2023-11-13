import {ModelLike} from "@cmmn/domain/worker";
import {Context, DomainLocator, IContextActions, IMessageActions, Message} from "@cotext/sdk";
import {utc} from "@cmmn/core";
import {Api} from "../infr/api";
export class ContextStore{

    constructor(public readonly URI: string,
                protected readonly api: Api,
                protected readonly locator: DomainLocator) {
        this.api.joinRoom(URI).then(x => x)
    }


    protected context = this.locator.GetOrCreateContext(this.URI, undefined) as ModelLike<Context, IContextActions>;
    public get Messages(): Array<ModelLike<Message, IMessageActions>>{
        return this.context.State.Messages.map(x => this.locator.GetMessage(this.URI, x))
    }
    CreateMessage() {
        this.context.Actions.CreateMessage({
            Content: '',
            CreatedAt: utc(),
            UpdatedAt: utc(),
        } as Message);
    }
}