import { LWWCell } from '../common/lww-cell'
import { Channel } from '../common/channel'

export class Client<T> {
  protected lwwCell = new LWWCell<T>(undefined);
  private static channel = new Channel<Message>('sdk');

  constructor(private id: string) {

  }

  public subscribe(){
    Client.channel.on(this.id, e => {
      this.lwwCell.setAt(e.clock, e.data);
    });
  }

  public action(click: Date, patch: Patch<T> | T, data: any){
    if (typeof patch === "function"){
      this.lwwCell.setAt(clock, (patch as Patch<T>)(this.lwwCell.get()))
    } else {
      this.lwwCell.setAt(clock, patch);
    }
    Client.channel.send(this.id, {clock, data});
  }
}
export type Patch<T> = ((t: T) => T);
export type Message = {
  clock: Date;
  data: any;
}