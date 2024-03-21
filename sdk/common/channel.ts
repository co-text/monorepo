import { EventEmitter } from '@cmmn/core'

export class Channel<T> extends EventEmitter<Record<string, T>>{
  private base = new BroadcastChannel(this.name);
  constructor(private name: string) {
    super();
  }

  private isSubscribed = false;
  protected subscribe(eventName: keyof Record<string, T>) {
    super.subscribe(eventName)
    if (this.isSubscribed) return;
    this.isSubscribed = true;
    this.base.addEventListener('message', this.onMessage);
  }

  protected unsubscribe (eventName: keyof Record<string, T>) {
    super.unsubscribe(eventName)
    if (!this.isSubscribed) return;
    this.isSubscribed = false;
    this.base.removeEventListener('message', this.onMessage);
  }

  private onMessage = (event: MessageEvent) => {
    const data = event.data as { id: string; data: T};
    if (!data.id || !data.data) return;
    this.emit(data.id, data.data);
  }

  public send(id: string, data: T){
    this.base.postMessage({id, data: data});
  }
}