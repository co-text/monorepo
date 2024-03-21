import { cell } from '@cmmn/cell'
import { ContextClient } from './context.client'
import { Client } from './client'
import { Message } from '@model'
import { Fn } from '@cmmn/core'

export class MessageClient extends Client<Message>{

  @Fn.cache()
  public static get(id: string): MessageClient {
    return new MessageClient(id);
  }

  private constructor(id: string) {
    super(id);
  }

  @cell
  public get state() {
    return this.lwwCell.get()
  }

}