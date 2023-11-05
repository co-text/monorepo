import {WorkerEntry} from "@cmmn/domain/worker";
import {Container} from "@cmmn/core";
import {DomainContainer} from "@cotext/sdk";
import {DomainLocator} from "@cotext/sdk";
import {Locator} from "@cmmn/domain/worker";

export const WorkerContainer = Container.withProviders(WorkerEntry)
;
WorkerContainer.provide(DomainContainer());
WorkerContainer.provide([
    {provide: Locator, useFactory: cont => cont.get(DomainLocator)},
    DomainLocator,
]);
// WorkerContainer.provide(InfrContainer());
