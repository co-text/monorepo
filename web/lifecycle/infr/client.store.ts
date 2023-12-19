import {EventEmitter, Fn} from "@cmmn/core";
import {Cell, ICellOptions} from "@cmmn/cell";

/**
 * Stores opened windows within one browser
 */
export class ClientStore extends EventEmitter<{
    change: {isMain: boolean}
}>{
    private mainWindowChannel = new BroadcastChannel('main');
    private id = Fn.ulid();
    private state = 'connected';
    private clients = new Set<string>();
    private mainClient = new LocalStorageCell<string>('ClientStoreMainClient');
    constructor() {
        super();
        this.mainWindowChannel.addEventListener('message', e => {
            if (e.data.state == 'connected'){
                this.clients.add(e.data.id);
            }
            if (e.data.state == 'disconnected'){
                this.clients.delete(e.data.id);
            }
            console.log(e.data);
            if (e.data.newMain){
                this.mainClient.set(e.data.newMain);
            }
        });
        this.mainWindowChannel.postMessage({
            id: this.id,
            state: this.state,
        });
        window.addEventListener('beforeunload', e => {
            console.log('beforeunload')
            const newMain = this.isMain ? Array.from(this.clients).sort()[0] : null
            this.state = 'disconnected';
            this.mainClient.set(null);
            this.mainWindowChannel.postMessage({
                id: this.id,
                state: this.state,
                newMain
            });
        });
        if (!this.mainClient.get()){
            this.mainClient.set(this.id);
        }
        Cell.OnChange(() => this.isMain, e => this.emit('change', {isMain: e.value}))
    }

    public get isMain(){
        return this.mainClient.get() == this.id;
    }


}

export class LocalStorageCell<T> extends Cell<T> {
    constructor(name: string, options: ICellOptions<T> = {}) {
        super(JSON.parse(localStorage.getItem(name) || "null"), {
            ...options,
            onExternal: value => {
                localStorage.setItem(name, JSON.stringify(value));
                options.onExternal?.(value);
            }
        });

    }

}