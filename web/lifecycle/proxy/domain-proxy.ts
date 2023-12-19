import {Injectable} from "@cmmn/core";
import {DomainState}from "@cotext/sdk";
import {EntityLocator, ModelProxy, proxy, Stream} from "@cmmn/domain/proxy";
import type {IDomainActions} from "@cotext/sdk";
import {ContextProxy, IContextProxy} from "./context-proxy";
import { ModelMap } from "./model-map";

@Injectable()
export class DomainProxy extends ModelProxy<DomainState, IDomainActions> {
    constructor(stream: Stream, locator: EntityLocator) {
        super(stream, locator);
        globalThis['root'] = this;

    }

    getContext(uri: string): ContextProxy {
        return this.ContextsMap.get(uri);
    }

    private ContextsMap = new ModelMap<ContextProxy>(
        this.stream, this.locator,
        () => this.State.Contexts,
        ContextProxy,
        key => ['Contexts', key]
    );
}

