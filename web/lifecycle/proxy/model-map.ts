import {ModelProxy, ModelAction, ModelKey, Stream, Locator, ModelPath} from "@cmmn/domain/proxy";

export class ModelMap<TModelProxy extends ModelProxy<TState, TActions>, TState = any, TActions extends ModelAction = {}> {
    constructor(private stream: Stream,
                private locator: Locator,
                private getKeys: () => ReadonlyArray<ModelKey>,
                private proxyConstructor: {
                    new (stream: Stream, locator: Locator): TModelProxy
                },
                private getPath: (key: ModelKey) => ModelPath) {
    }

    private cache = new Map<ModelKey, TModelProxy>()

    get(id: ModelKey): TModelProxy {
        return this.getOrAdd(id, id => {
            const path = this.getPath(id);
            return new this.proxyConstructor(
                this.stream.getSubStream(path),
                this.locator
            );
        });
    }

    public getOrAdd(key: string | number, factory: (key: (string | number)) => ModelProxy<any, any>): TModelProxy {
        if (this.cache.has(key))
            return this.cache.get(key)!;
        const newItem = factory(key) as TModelProxy;
        this.cache.set(key, newItem);
        return newItem;
    }

    public* entries(): IterableIterator<[ModelKey, TModelProxy]> {
        for (let key of this.keys()) {
            yield [key, this.get(key)];
        }
    }
    public* values(): IterableIterator<TModelProxy> {
        for (let key of this.keys()) {
            yield this.get(key);
        }
    }

    public* keys(): IterableIterator<ModelKey> {
        const keys = this.getKeys();
        if (!keys)
            return;
        for (let key of keys) {
            yield key;
        }
    }

}
