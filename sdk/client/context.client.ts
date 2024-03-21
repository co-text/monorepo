import { cell } from '@cmmn/cell'
import { Context, Message } from '@model'
import { MessageClient } from './message.client'
import { Client } from './client'
import { IMessageProxy } from '@cotext/lifecycle/proxy'
import { Op } from '../common/op'
import { Fn } from '@cmmn/core'

export class ContextClient extends Client<Context> {

  @Fn.cache()
  public static get(uri: string): ContextClient {
    return new ContextClient(uri);
  }

  private constructor(uri: string) {
    super(uri);
  }

  @cell
  public get state(){
    return this.lwwCell.get();
  }


  @cell
  public get messages(){
    return this.state?.Messages.map(x => MessageClient.get(x));
  }

  public CreateMessage(message: Message, index = this.messages.length): IMessageProxy {
    const state = {
      ...this.state,
      Messages: [
        ...this.state.Messages.slice(0, index),
        message.id,
        ...this.state.Messages.slice(index)
      ]
    };
    const clock = new Date();
    this.action(clock, state, [
      [Op.addMessage, index, message.id],
    ]);
    const result = MessageClient.get(message.id);
    result.action(clock, message, [
      [Op.setMessage, message]
    ]);
    return result;
  }
}

