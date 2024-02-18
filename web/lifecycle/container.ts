import {Container} from "@cmmn/core";
import {useWorkerDomain, useStreamDomain} from "@cmmn/domain/proxy";
import {uiContainer} from "@ui";
import {storeContainer} from "@stores/container";
import {Api} from "./infr/api";
import {DomainContainer, DomainLocator} from "@cotext/sdk";
import {Locator} from "@cmmn/domain/proxy";
export const container = new Container();
container.provide(uiContainer);
container.provide(storeContainer);
container.provide([Api]);
const useWorker = true;
if (useWorker){
    container.provide(
        useWorkerDomain(new Worker(PRODUCTION ? "/worker.min.js" : "/worker.js"))
    );
} else {
    // container.provide(useStreamDomain());
    // container.provide([
    //     {provide: Locator, useFactory: c => c.get(DomainLocator)},
    // ])
    // container.provide(DomainContainer());
}
