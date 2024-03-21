import { Cell } from '@cmmn/cell'

export class LWWCell<T> extends Cell<T> {
  private clock = new Date();

  public setAt(clock: Date, value: T): void {
    if (clock > this.clock) {
      this.set(value);
    }
  }
}