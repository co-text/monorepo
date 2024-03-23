import { Cell } from '@cmmn/cell'

export class LWWCell<T> extends Cell<T> {
    private clock = this.now();

    public setAt(clock: Clock, value: T): void {
        if (clock >= this.clock) {
            this.set(value);
        }
    }

    now(): Clock {
        return performance.now();
    }

}

type Clock = number;