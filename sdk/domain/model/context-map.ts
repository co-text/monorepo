import {ObservableMap} from "@cmmn/cell";
import {ContextModel} from "@domain/model/context-model";
import {DomainLocator} from "@domain/model/domain-locator.service";

export class ContextMap extends ObservableMap<string, ContextModel> {
    constructor(private locator: DomainLocator) {
        super();
    }

    get(uri: string) {
        return super.get(uri) ?? this.create(uri, null);
    }

    public create(uri: string, parentURI: string): ContextModel {
        const context = new ContextModel(uri, this.locator);
        this.set(uri, context);
        return context;
    }
}