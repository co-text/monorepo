import {Injectable} from "@cmmn/core";
import {Context, DomainState}from "@cotext/sdk";
import {EntityLocator, ModelKey, ModelMap, ModelProxy, Stream} from "@cmmn/domain/proxy";
import type {IDomainActions} from "@cotext/sdk";
import {IContextProxy} from "./context-proxy";

@Injectable()
export class DomainProxy extends ModelProxy<DomainState, IDomainActions> {
    constructor(stream: Stream, locator: EntityLocator) {
        super(stream, locator);
        globalThis['root'] = this;
    }


    get Contexts(): ReadonlyArray<IContextProxy> {
        return [...this.ContextsMap.values()];
    }

    ContextsMap: Map<ModelKey, IContextProxy>;
}

