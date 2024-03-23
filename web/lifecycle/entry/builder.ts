import { Container } from "@cmmn/core";
import { uiContainer } from "@ui";
import { storeContainer } from "@stores/container";
import { Api } from "@infr/api";
import { Builder } from '@cmmn/app';

export const builder = new Builder()
    .withRoutes({
        routes: [{
            path: '/',
            name: 'root',
        }, {
            path: '/:id',
            name: 'main',
        }],
        // @ts-ignore
        options: {}
    })
    .with(storeContainer)
    .with(Container.withProviders(Api))
    .withUI(uiContainer)

const useWorker = false;

if (useWorker) {
    globalThis.SharedWorker ??= class {
    } as any;
    new SharedWorker(PRODUCTION ? "/worker.min.js" : "/worker.js");
} else {
    const script = document.createElement('script')
    script.src = '/worker.js';
    document.head.appendChild(script);
    // container.provide(useStreamDomain());
    // container.provide([
    //     {provide: Locator, useFactory: c => c.get(DomainLocator)},
    // ])
    // container.provide(DomainContainer());
}
