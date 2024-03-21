import { cell } from '@cmmn/cell'
import { Context, Message } from '@model'
import { MessageClient } from './message.client'
import { Client } from './base/client'
import { Op } from '../common'
import { Fn } from '@cmmn/core'
import { IContextProxy, } from "./interfaces/context-proxy";
import { IMessageProxy } from "./interfaces/message-proxy";

export class ContextClient extends Client<Context> implements IContextProxy {

    @Fn.cache()
    public static get(uri: string): ContextClient {
        return new ContextClient(uri);
    }

    private constructor(public uri: string) {
        super();
    }

    get path(){
        return this.uri;
    }

    @cell
    public get State() {
        return this.get();
    }

    @cell
    public get Messages() {
        return this.State?.Messages.map(x => MessageClient.get(this.uri +'#'+ x) as IMessageProxy) ?? [];
    }


    public CreateMessage(message: Message, index = this.Messages.length): IMessageProxy {
        if (!message.id) message.id = Fn.ulid();
        const state = {
            ...this.State,
            Messages: [
                ...this.State.Messages.slice(0, index),
                message.id,
                ...this.State.Messages.slice(index)
            ]
        };
        this.action(state, Op.addMessage, [index, message.id]);
        const result = MessageClient.get(this.uri +'#'+ message.id);
        result.patch(message);
        return result;
    }

  public InsertMessage(id: string, index: number): void {
      const state = {
          ...this.State,
          Messages:  [
              ...this.State.Messages.slice(0, index),
              id,
              ...this.State.Messages.slice(index),
          ]
      }
      this.action(state, Op.addMessage, [index, id]);
  }


  get Parents(): ReadonlyArray<IMessageProxy> {
    return undefined;
  }

  RemoveMessage(id: string): void {
      const state = {
          ...this.State,
          Messages:  this.State.Messages.filter(x => x !== id)
      };

      this.action( state, Op.removeMessage, [id]);
  }
}

